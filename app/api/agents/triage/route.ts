// app/api/agents/triage/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin'; // adjust path if needed

export async function POST(req: Request) {
  try {
    const { scope, courseSlug, moduleSlug, lessonSlug, prompt } = await req.json();

    if (!courseSlug || !prompt) {
      return NextResponse.json({ error: 'courseSlug and prompt are required' }, { status: 400 });
    }

    // TODO: look up target rows and apply edits (LLM or stub)
    // Minimal stub to prove the path works:
    // await supabaseAdmin.from('agent_events').insert({ run_id: null, phase: 'TriageAgent', message: `Stub edit: ${courseSlug}` });

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'triage failed' }, { status: 500 });
  }
}


