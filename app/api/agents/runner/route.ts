// app/api/agents/runner/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';

async function log(runId: string, phase: string, message: string, meta: any = {}, level: 'info'|'warn'|'error' = 'info') {
  await supabaseAdmin.from('agent_events').insert({ run_id: runId, phase, level, message, meta });
  await supabaseAdmin.from('agent_runs').update({ summary: message }).eq('id', runId);
}

export async function POST(req: Request) {
  const { runId } = await req.json();

  // Flip to running ASAP so we can see the runner actually fired
  await supabaseAdmin.from('agent_runs').update({ status: 'running', progress: 5, summary: 'Starting…' }).eq('id', runId);

  try {
    // Load run (for course_id & payload)
    const { data: run, error: runErr } = await supabaseAdmin
      .from('agent_runs')
      .select('id, course_id, payload')
      .eq('id', runId)
      .single();
    if (runErr || !run) throw new Error('Run not found');

    await log(runId, 'ModuleAgent', 'Proposing modules…');

    // --- STUB: insert modules ---
    const modules = [
      { slug: 'foundations', title: 'Foundations', description: 'Core ideas', position: 1 },
      { slug: 'applications', title: 'Applications', description: 'Real-world use', position: 2 },
    ];
    for (const m of modules) {
      const { error } = await supabaseAdmin.from('modules').insert({ course_id: run.course_id, ...m });
      if (error) throw new Error(`Insert module failed: ${error.message}`);
    }
    await supabaseAdmin.from('agent_runs').update({ progress: 35 }).eq('id', runId);
    await log(runId, 'ModuleAgent', `Inserted ${modules.length} modules`);

    // --- STUB: insert lessons ---
    for (const m of modules) {
      await log(runId, 'LessonAgent', `Generating lessons for ${m.title}…`, { module: m.slug });

      const { data: modRow, error: modErr } = await supabaseAdmin
        .from('modules')
        .select('id')
        .eq('course_id', run.course_id)
        .eq('slug', m.slug)
        .single();
      if (modErr || !modRow) throw new Error('Module row not found after insert');

      const lessons = [
        { slug: 'lesson-1', title: 'Lesson 1', position: 1, objectives: 'Understand X; Apply Y', content: 'Generated text for lesson 1…' },
        { slug: 'lesson-2', title: 'Lesson 2', position: 2, objectives: 'Explain A; Evaluate B', content: 'Generated text for lesson 2…' },
      ];

      for (const L of lessons) {
        const { error } = await supabaseAdmin.from('lessons').insert({ module_id: modRow.id, ...L });
        if (error) throw new Error(`Insert lesson failed: ${error.message}`);
      }
    }

    await supabaseAdmin.from('agent_runs').update({ status: 'succeeded', progress: 100, summary: 'Generation complete' }).eq('id', runId);
    await log(runId, 'Pipeline', 'Course generation complete');
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    await supabaseAdmin
      .from('agent_runs')
      .update({ status: 'failed', summary: 'Generation failed', error: e?.message ?? 'unknown' })
      .eq('id', runId);
    await log(runId, 'Pipeline', `Error: ${e?.message ?? 'unknown'}`, {}, 'error');
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}
