import { NextRequest, NextResponse } from 'next/server';
import { runTriage } from '@/agents/triage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const scope = body.scope as 'course'|'module'|'lesson';
    const courseSlug = body.courseSlug as string;
    const moduleSlug = body.moduleSlug as string | undefined;
    const lessonSlug = body.lessonSlug as string | undefined;
    const prompt = body.prompt as string;

    if (!scope || !courseSlug || !prompt) {
      return NextResponse.json({ error: 'scope, courseSlug and prompt required' }, { status: 400 });
    }

    const result = await runTriage({ scope, courseSlug, moduleSlug, lessonSlug, prompt });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}

