import { supabaseAdmin } from '@/lib/server/supabase';
import { ok, badRequest, serverError } from '@/lib/server/http';
type Params = { courseSlug: string };

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { courseSlug } = await ctx.params;

  const { data: course, error: cErr } = await supabaseAdmin
    .from('courses').select('id').eq('slug', courseSlug).maybeSingle();
  if (cErr) return serverError(cErr.message);
  if (!course) return ok({ modules: [] });

  const { data, error } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', course.id)
    .order('position', { ascending: true });

  if (error) return serverError(error.message);
  return ok({ modules: data ?? [] });
}
export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { courseSlug } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { slug, title, position = 1 } = body ?? {};
  if (!slug || !title) return Response.json({ error: 'slug and title required' }, { status: 400 });

  const { data: course, error: cErr } = await supabaseAdmin
    .from('courses').select('id').eq('slug', courseSlug).maybeSingle();
  if (cErr) return Response.json({ error: cErr.message }, { status: 500 });
  if (!course) return Response.json({ error: 'course not found' }, { status: 404 });

  const { error } = await supabaseAdmin
    .from('modules')
    .upsert({ course_id: course.id, slug, title, position }, { onConflict: 'course_id,slug' });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
