import { supabaseAdmin } from '@/lib/supabase-admin';
import sanitizeHtml from 'sanitize-html';

type Scope = 'course'|'module'|'lesson';
export type TriageInput = {
  scope: Scope;
  courseSlug: string;
  moduleSlug?: string;
  lessonSlug?: string;
  prompt: string;
};
export type TriageResult = {
  status: 'completed'|'failed';
  diff?: Record<string, { before: string|null; after: string|null }>;
  error?: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Minimal sanitizer policy (tighten as needed)
const CLEAN = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      'p','em','strong','b','i','u','ul','ol','li','h1','h2','h3','h4','blockquote',
      'code','pre','span','sup','sub','a','img','br','hr'
    ],
    allowedAttributes: {
      a: ['href','title','rel','target'],
      img: ['src','alt']
    },
    allowedSchemes: ['http','https','data'],
    allowVulnerableTags: false
  });

async function llmRewrite(opts: {
  instruction: string;
  contentKind: 'description'|'title'|'lesson_html';
  original: string;
}) {
  if (!OPENAI_API_KEY) {
    // Fallback: deterministic heuristic if key absent
    return `<p><em>Revision request:</em> ${opts.instruction}</p>\n${opts.original}`;
  }

  const system = `You are an expert course editor. Rewrite the provided HTML (or plain text) according to the instruction.
- Preserve valid HTML structure.
- Keep math inline as plain text if present.
- Do not invent external links or images unless requested.
- Return ONLY the revised HTML/text; no preamble.`;

  const user = `Instruction:\n${opts.instruction}\n\nOriginal:\n${opts.original}`;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // pick your preferred small model
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.4
    })
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI API error: ${t}`);
  }
  const data = await resp.json();
  const out = (data?.choices?.[0]?.message?.content ?? '').toString();
  return CLEAN(out);
}

export async function runTriage(input: TriageInput): Promise<TriageResult> {
  try {
    if (input.scope === 'course') {
      const { data: course } = await supabaseAdmin
        .from('courses').select('id,title,description')
        .eq('slug', input.courseSlug).maybeSingle();
      if (!course) return { status: 'failed', error: 'Course not found' };

      const before = course.description ?? '';
      const after  = await llmRewrite({ instruction: input.prompt, contentKind: 'description', original: before });

      const { error: uErr } = await supabaseAdmin
        .from('courses').update({ description: after }).eq('id', course.id);
      if (uErr) return { status: 'failed', error: uErr.message };

      return { status: 'completed', diff: { description: { before, after } } };
    }

    if (input.scope === 'module') {
      const { data: c } = await supabaseAdmin.from('courses').select('id').eq('slug', input.courseSlug).maybeSingle();
      if (!c) return { status: 'failed', error: 'Course not found' };

      const { data: m } = await supabaseAdmin
        .from('modules').select('id,title').eq('course_id', c.id).eq('slug', input.moduleSlug!).maybeSingle();
      if (!m) return { status: 'failed', error: 'Module not found' };

      const before = m.title;
      const after  = await llmRewrite({ instruction: input.prompt, contentKind: 'title', original: before });

      const { error: uErr } = await supabaseAdmin
        .from('modules').update({ title: after }).eq('id', m.id);
      if (uErr) return { status: 'failed', error: uErr.message };

      return { status: 'completed', diff: { title: { before, after } } };
    }

    // lesson
    const { data: c } = await supabaseAdmin.from('courses').select('id').eq('slug', input.courseSlug).maybeSingle();
    if (!c) return { status: 'failed', error: 'Course not found' };

    const { data: m } = await supabaseAdmin
      .from('modules').select('id').eq('course_id', c.id).eq('slug', input.moduleSlug!).maybeSingle();
    if (!m) return { status: 'failed', error: 'Module not found' };

    const { data: l } = await supabaseAdmin
      .from('lessons')
      .select('id,title,summary,content_html')
      .eq('module_id', m.id).eq('slug', input.lessonSlug!).maybeSingle();
    if (!l) return { status: 'failed', error: 'Lesson not found' };

    const beforeSummary = l.summary ?? '';
    const beforeHtml    = l.content_html ?? '';

    const [afterSummary, afterHtml] = await Promise.all([
      llmRewrite({ instruction: `Revise the SUMMARY only. ${input.prompt}`, contentKind: 'lesson_html', original: beforeSummary || '<p></p>' }),
      llmRewrite({ instruction: `Revise the BODY only. ${input.prompt}`, contentKind: 'lesson_html', original: beforeHtml || '<p></p>' })
    ]);

    const { error: uErr } = await supabaseAdmin
      .from('lessons')
      .update({ summary: afterSummary, content_html: afterHtml })
      .eq('id', l.id);
    if (uErr) return { status: 'failed', error: uErr.message };

    return {
      status: 'completed',
      diff: {
        summary: { before: beforeSummary, after: afterSummary },
        content_html: { before: beforeHtml, after: afterHtml }
      }
    };
  } catch (e: any) {
    return { status: 'failed', error: e?.message ?? 'Unknown error' };
  }
}
