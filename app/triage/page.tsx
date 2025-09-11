import { supabaseAdmin } from '@/lib/supabase-admin';
import TriageForm from '@/components/TriageForm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

async function getData() {
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, published, visibility')
    .order('created_at', { ascending: false });
  return { courses: (courses ?? []).filter(c => c.published && c.visibility === 'public') };
}

export const revalidate = 600;

export default async function TriagePage() {
  const { courses } = await getData();

  async function submit(formData: FormData) {
    'use server';

    const scope = String(formData.get('scope') || 'course') as 'course'|'module'|'lesson';
    const courseSlug = String(formData.get('course') || '');
    const moduleSlug = String(formData.get('module') || '');
    const lessonSlug = String(formData.get('lesson') || '');
    const prompt = String(formData.get('prompt') || '').trim();
    if (!courseSlug || !prompt) throw new Error('course and prompt are required');

    // ✅ Build absolute origin from request headers (no envs required)
    const h = await headers();
    const proto = h.get('x-forwarded-proto') ?? 'https';
    const host  = h.get('x-forwarded-host')  ?? h.get('host');
    const origin = `${proto}://${host}`;

    // ✅ Call the API endpoint directly
    const res = await fetch(`${origin}/api/agents/triage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scope, courseSlug, moduleSlug, lessonSlug, prompt }),
      cache: 'no-store',
    });

    // Helpful error: include response text if non-200
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `triage failed (HTTP ${res.status})`);
    }

    // Optional: parse response (e.g., { runId })
    // const { runId } = await res.json().catch(() => ({}));

    // Revalidate affected pages
    revalidatePath('/');
    revalidatePath(`/${courseSlug}`);
    if (moduleSlug) revalidatePath(`/${courseSlug}/${moduleSlug}`);
    if (lessonSlug) revalidatePath(`/${courseSlug}/${moduleSlug}/${lessonSlug}`);
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto' }}>
      <h1>Triage Agent</h1>
      <p>Edit content at the course, module, or lesson level.</p>
      <TriageForm courses={courses} action={submit} />
      <p className="text-secondary mt-2">
        Changes are applied server-side. Navigate to the updated page to review output.
      </p>
    </main>
  );
}