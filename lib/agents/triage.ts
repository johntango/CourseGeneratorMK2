// lib/agents/triage.ts
export type TriageInput = {
  scope: 'course' | 'module' | 'lesson';
  courseSlug: string;
  moduleSlug?: string;
  lessonSlug?: string;
  prompt: string;
};

export type TriageResult =
  | { status: 'ok'; runId?: string }
  | { status: 'failed'; error: string };

export async function runTriage(input: TriageInput): Promise<TriageResult> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const res = await fetch(`${base}/api/agents/triage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
    // no-store so you don't cache responses in dev
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { status: 'failed', error: json?.error || `HTTP ${res.status}` };

  return json?.runId ? { status: 'ok', runId: json.runId } : { status: 'ok' };
}
