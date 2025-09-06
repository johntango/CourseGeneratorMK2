import { supabaseAdmin } from '@/lib/server/supabase';
type Params = { course: string };

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { course } = await ctx.params;
  const { data: c, error: cErr } = await supabaseAdmin.from('courses').select('id').eq('slug', course).maybeSingle();
  if (cErr) return Response.json({ error: cErr.message }, { status: 500 });
  if (!c)   return Response.json({ modules: [] });

  const { data, error } = await supabaseAdmin
    .from('modules').select('id, slug, title, position')
    .eq('course_id', c.id)
    .order('position', { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ modules: data ?? [] });
}

export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { course } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { slug, title, position = 1 } = body ?? {};
  if (!slug || !title) return Response.json({ error: 'slug and title required' }, { status: 400 });

  const { data: c } = await supabaseAdmin.from('courses').select('id').eq('slug', course).maybeSingle();
  if (!c) return Response.json({ error: 'course not found' }, { status: 404 });

  const { error } = await supabaseAdmin
    .from('modules')
    .upsert({ course_id: c.id, slug, title, position }, { onConflict: 'course_id,slug' });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
