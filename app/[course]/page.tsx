// app/[course]/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 120;

export default async function CoursePage(
  props: { params: Promise<{ course: string }> }
) {
  const { course: courseSlug } = await props.params;

  const { data: courseRow, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, description, published, visibility')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (cErr) throw new Error(`Failed to load course: ${cErr.message}`);
  if (!courseRow || !courseRow.published || courseRow.visibility !== 'public') notFound();

  const { data: modules, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', courseRow.id)
    .order('position', { ascending: true });

  if (mErr) throw new Error(`Failed to load modules: ${mErr.message}`);

  return (
    <main>
      <h1>{courseRow.title}</h1>
      {courseRow.description && <p>{courseRow.description}</p>}
      <h2>Modules</h2>
      <ul>
        {(modules ?? []).map((m) => (
          <li key={m.id}>
            <Link href={`/${courseRow.slug}/${m.slug}`}>{m.title}</Link>
          </li>
        ))}
      </ul>
      {!modules?.length && <p>No modules yet.</p>}
    </main>
  );
}
