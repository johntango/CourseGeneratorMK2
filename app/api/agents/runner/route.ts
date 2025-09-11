import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { runCourseGeneration } from '@/app/api/agents/lib/agents';

async function log(runId: string, phase: string, message: string, meta: any = {}, level: 'info'|'warn'|'error' = 'info') {
  await supabaseAdmin.from('agent_events').insert({ run_id: runId, phase, level, message, meta });
  await supabaseAdmin.from('agent_runs').update({ summary: message }).eq('id', runId);
}

export async function POST(req: Request) {
  const { runId } = await req.json();
  await supabaseAdmin.from('agent_runs').update({ status: 'running', progress: 5, summary: 'Starting…' }).eq('id', runId);

  try {
    const { data: run } = await supabaseAdmin
      .from('agent_runs').select('id, course_id, payload').eq('id', runId).single();
    if (!run) throw new Error('Run not found');

    const { data: course } = await supabaseAdmin
      .from('courses').select('id, title, slug').eq('id', run.course_id).single();
    if (!course) throw new Error('Course not found');

    await log(runId, 'ModuleAgent', 'Generating modules…', { level: run.payload?.level, style: run.payload?.style });

    const result = await runCourseGeneration({
      courseId: course.id,
      courseTitle: run.payload?.title ?? course.title,
      level: (run.payload?.level ?? 'intro'),
      style: run.payload?.style ?? 'project-based',
      learnerLevel: run.payload?.learnerLevel ?? 'undergrad',
    });

    await supabaseAdmin.from('agent_runs').update({ progress: 95 }).eq('id', runId);
    await log(runId, 'LessonAgent', 'Lessons persisted', result);

    await supabaseAdmin.from('agent_runs').update({ status: 'succeeded', progress: 100, summary: 'Generation complete' }).eq('id', runId);
    await log(runId, 'Pipeline', 'Course generation complete');

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    await supabaseAdmin.from('agent_runs')
      .update({ status: 'failed', summary: 'Generation failed', error: e?.message ?? 'unknown' })
      .eq('id', runId);
    await log(runId, 'Pipeline', `Error: ${e?.message ?? 'unknown'}`, {}, 'error');
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}
