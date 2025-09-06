import { supabaseAdmin } from '@/lib/server/supabase';
type Params = { course: string; module: string };

async function ids(courseSlug: string, moduleSlug: string) {
  const { data: c } = await supabaseAdmin.from('courses').select('id').eq('slug', courseSlug).maybeSingle();
  if (!c) return null;
  const { data: m } = await supabaseAdmin.from('modules').select('id').eq('course_id', c.id).eq('slug', moduleSlug).maybeSingle();
  if (!m) return null;
  return { courseId: c.id, moduleId: m.id };
}

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  const { course, module } = await ctx.params;
  const scope = await ids(course, module);
  if (!scope) return Response.json({ error: 'not found' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const { error } = await supabaseAdmin.from('modules').update(body).eq('id', scope.moduleId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const { course, module } = await ctx.params;
  const scope = await ids(course, module);
  if (!scope) return Response.json({ error: 'not found' }, { status: 404 });
  const { error } = await supabaseAdmin.from('modules').delete().eq('id', scope.moduleId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
