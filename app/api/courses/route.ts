// app/api/courses/route.ts
import { supabaseAdmin } from '@/lib/server/supabase';
import { ok, badRequest, serverError } from '@/lib/server/http';
import { courseUpsert } from '@/lib/validation/schema';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim();
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, description, visibility, published, created_at')
    .order('created_at', { ascending: false });

  if (error) return serverError(error.message);

  let filtered = data ?? [];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }
  return ok({ courses: filtered });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Validate base course fields
  const parsed = courseUpsert.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message ?? 'Invalid payload');
  }

  const {
    slug, title, description, visibility, published,
  } = parsed.data as {
    slug: string;
    title: string;
    description?: string | null;
    visibility: 'public' | 'private';
    published: boolean;
  };

  // Optional generation knobs passed from the client
  const generate = typeof (body as any).generate === 'boolean' ? Boolean((body as any).generate) : false;
  const level = (body as any).level as ('intro' | 'intermediate' | 'advanced' | undefined);
  const style = (body as any).style as (string | undefined);

  // Upsert the course and return the row (so we have id)
  const { data: course, error: upsertErr } = await supabaseAdmin
    .from('courses')
    .upsert(
      { slug, title, description: description ?? null, visibility, published },
      { onConflict: 'slug' },
    )
    .select('id, slug, title, description, visibility, published, created_at')
    .single();

  if (upsertErr) return serverError(upsertErr.message);

  // Optionally start the async generation pipeline via Agents
  let runId: string | null = null;
  if (generate) {
    try {
      const h = await headers();
      const proto = h.get('x-forwarded-proto') ?? 'https';
      const host = h.get('x-forwarded-host') ?? h.get('host');
      if (!host) throw new Error('Missing Host header');

      const base = `${proto}://${host}`;

      const resp = await fetch(`${base}/api/agents/start-course-generation`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          title: course.title,
          level: level ?? 'intro',
          style: style ?? 'project-based',
          learnerLevel: 'undergrad',
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        runId = json.runId ?? null;
      } else {
        console.error('start-course-generation failed', await resp.text());
      }
    } catch (e) {
      console.error('start-course-generation error', e);
    }
  }

  // Return course + optional runId so client can redirect to /courses/[slug]?run=...
  return ok({
    course,
    enqueued: generate,
    runId,
    level: level ?? null,
    style: style ?? null,
  });
}
