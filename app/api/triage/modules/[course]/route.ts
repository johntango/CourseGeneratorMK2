// app/api/triage/modules/[course]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: Request,
  { params }: { params: { course: string } }
) {
  const courseSlug = params.course;

  const { data: course, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const { data: modules, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', course.id)
    .order('position', { ascending: true });

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  return NextResponse.json({ course, modules: modules ?? [] });
}
