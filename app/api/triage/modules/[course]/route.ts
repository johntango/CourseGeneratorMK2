import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Params = { course: string };

export async function GET(
  _req: Request,
  ctx: { params: Promise<Params> }   // <-- Promise here
) {
  const { course } = await ctx.params; // <-- await required

  const { data: c, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title')
    .eq('slug', course)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!c)   return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const { data: modules, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', c.id)
    .order('position', { ascending: true });

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  return NextResponse.json({ course: c, modules: modules ?? [] });
}

