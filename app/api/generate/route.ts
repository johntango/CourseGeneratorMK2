import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { toSlug, type Prompt } from '../../../agents/utils';
import { outlineAgent } from '../../../agents/outline';
import { textAgent } from '../../../agents/text';
import { imageAgent } from '../../../agents/image';

// If you don't have the @ alias configured, change the imports above to relative paths.

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Partial<Prompt> & { description?: string };

    if (!payload.course_title) {
      return NextResponse.json({ error: 'course_title required' }, { status: 400 });
    }

    const prompt: Prompt = {
      course_title: payload.course_title!,
      course_level: (payload.course_level as any) || 'undergraduate',
      source_style: payload.source_style || 'project-based',
      learner_level: payload.learner_level || 'calculus-ready',
    };

    const courseSlug = toSlug(prompt.course_title);

    // 1) Upsert course
    const { data: course, error: cErr } = await supabaseAdmin
      .from('courses')
      .upsert(
        {
          slug: courseSlug,
          title: prompt.course_title,
          description: payload.description ?? null,
          published: true,
        },
        { onConflict: 'slug' },
      )
      .select('*')
      .single();

    if (cErr || !course) {
      throw new Error(`Course upsert failed: ${cErr?.message ?? 'unknown error'}`);
    }

    // 2) Build outline
    const outline = await outlineAgent(prompt);

    // 3) Insert modules/lessons
    let positionModule = 1;
    for (const mod of outline.modules) {
      const { data: module, error: mErr } = await supabaseAdmin
        .from('modules')
        .upsert(
          {
            course_id: course.id,
            slug: mod.slug,
            title: mod.title,
            position: positionModule++,
          },
          { onConflict: 'course_id,slug' },
        )
        .select('*')
        .single();

      if (mErr || !module) {
        throw new Error(`Module upsert failed: ${mErr?.message ?? 'unknown error'}`);
      }

      let positionLesson = 1;
      for (const les of mod.lessons) {
        const text = await textAgent(prompt, les.title);
        const img = await imageAgent(les.title);

        // Simple HTML rendering of the markdown for MVP purposes
        const html =
          `<h3>${text.title}</h3>` +
          `<p><em>${text.summary}</em></p>` +
          `<img src="${img.url}" alt="${img.alt}" style="max-width:100%;margin:12px 0;" />` +
          text.content_md
            .split('\n')
            .map((p) => `<p>${p}</p>`)
            .join('\n');

        const { error: lErr } = await supabaseAdmin.from('lessons').upsert(
          {
            module_id: module.id,
            slug: les.slug,
            title: text.title,
            summary: text.summary,
            content_md: text.content_md,
            content_html: html,
            published: true,
            position: positionLesson++,
          },
          { onConflict: 'module_id,slug' },
        );

        if (lErr) {
          throw new Error(`Lesson upsert failed: ${lErr.message}`);
        }
      }
    }

    return NextResponse.json({ ok: true, course_slug: courseSlug });
  } catch (err: any) {
    // Surface a JSON error (what your curl shows as the 500 page)
    return NextResponse.json(
      { error: err?.message ?? 'Internal Server Error' },
      { status: 500 },
    );
  }
}
