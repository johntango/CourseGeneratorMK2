// app/api/agents/start-course-generation/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin'; // or your path

export async function POST(req: Request) {
  const body = await req.json(); // { courseId, title, level, style, learnerLevel }
  const { data: run, error } = await supabaseAdmin
    .from('agent_runs')
    .insert({
      course_id: body.courseId,
      kind: 'course-generation',
      status: 'queued',
      payload: body,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Kick the worker
  const url = new URL(req.url);
  fetch(`${url.origin}/api/agents/runner`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ runId: run.id }),
  }).catch(() => {});

  return NextResponse.json({ runId: run.id }, { status: 202 });
}
