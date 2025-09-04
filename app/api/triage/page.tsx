import { supabaseAdmin } from '@/lib/supabase-admin';
import { runTriage } from '@/agents/triage';
import { revalidatePath } from 'next/cache';
import TriageForm from '@/components/TriageForm';


async function getData() {
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, published, visibility')
    .order('created_at', { ascending: false });
  return { courses: (courses ?? []).filter(c => c.published && c.visibility === 'public') };
}

export const revalidate = 60;

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

    // optional log row (if you created triage_requests table)
    // const { data: req } = await supabaseAdmin.from('triage_requests').insert({...}).select('*').single();

    const result = await runTriage({ scope, courseSlug, moduleSlug, lessonSlug, prompt });
    if (result.status === 'failed') throw new Error(result.error || 'triage failed');

    // Update caches
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
      <p style={{ opacity: 0.7, marginTop: 16 }}>
        Changes are applied server-side and sanitized. You can review the output by navigating to the updated URL.
      </p>
    </main>
  );
}
