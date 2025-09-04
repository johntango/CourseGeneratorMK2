import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: Request,
  ctx: { params: { course: string; module: string } }   // <-- NOT a Promise
) {
  const { course, module } = ctx.params;

  const { data: c, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('slug', course)
    .maybeSingle();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!c) return NextResponse.json({ lessons: [] }, { status: 200 });

  const { data: m, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('id')
    .eq('course_id', c.id)
    .eq('slug', module)
    .maybeSingle();
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
  if (!m) return NextResponse.json({ lessons: [] }, { status: 200 });

  const { data: lessons, error: lErr } = await supabaseAdmin
    .from('lessons')
    .select('slug, title, position, published')
    .eq('module_id', m.id)
    .order('position', { ascending: true });
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  return NextResponse.json({ lessons: lessons ?? [] }, { status: 200 });
}
