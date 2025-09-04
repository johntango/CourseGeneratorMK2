import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 120;

export default async function ModulePage(
  props: { params: Promise<{ course: string; module: string }> }
) {
  const { course: courseSlug, module: moduleSlug } = await props.params;

  const { data: courseRow } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, published, visibility')
    .eq('slug', courseSlug)
    .maybeSingle();
  if (!courseRow || !courseRow.published || courseRow.visibility !== 'public') notFound();

  const { data: moduleRow } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title')
    .eq('course_id', courseRow.id)
    .eq('slug', moduleSlug)
    .maybeSingle();
  if (!moduleRow) notFound();

  const { data: lessons, error: lErr } = await supabaseAdmin
    .from('lessons')
    .select('id, slug, title, summary, position, published')
    .eq('module_id', moduleRow.id)
    .eq('published', true)
    .order('position', { ascending: true });

  if (lErr) throw new Error(`Failed to load lessons: ${lErr.message}`);

  return (
    <main>
      <nav style={{ marginBottom: 12 }}>
        <Link href={`/${courseRow.slug}`}>← {courseRow.title}</Link>
      </nav>
      <h1>{moduleRow.title}</h1>
      <ul>
        {(lessons ?? []).map((l) => (
          <li key={l.id} style={{ margin: '8px 0' }}>
            <Link href={`/${courseRow.slug}/${moduleRow.slug}/${l.slug}`}>{l.title}</Link>
            {l.summary ? <div style={{ opacity: 0.8 }}>{l.summary}</div> : null}
          </li>
        ))}
      </ul>
      {!lessons?.length && <p>No published lessons yet.</p>}
    </main>
  );
}
