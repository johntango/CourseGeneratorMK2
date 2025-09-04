import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: Request,
  ctx: { params: { course: string } }   // <-- NOT a Promise here
) {
  const { course } = ctx.params;

  const { data: c, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('slug', course)
    .maybeSingle();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!c) return NextResponse.json({ modules: [] }, { status: 200 });

  const { data: modules, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('slug, title, position')
    .eq('course_id', c.id)
    .order('position', { ascending: true });
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  return NextResponse.json({ modules: modules ?? [] }, { status: 200 });
}
