import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const revalidate = 300;

export default async function LessonPage(
  props: { params: Promise<{ course: string; module: string; lesson: string }> }
) {
  const { course: courseSlug, module: moduleSlug, lesson: lessonSlug } = await props.params;

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

  const { data: lessonRow } = await supabaseAdmin
    .from('lessons')
    .select('id, slug, title, summary, content_html, content_md, published, updated_at')
    .eq('module_id', moduleRow.id)
    .eq('slug', lessonSlug)
    .maybeSingle();

  if (!lessonRow || !lessonRow.published) notFound();

  return (
    <main>
      <nav style={{ marginBottom: 12 }}>
        <Link href={`/${courseRow.slug}`}>← {courseRow.title}</Link>{' '}
        / <Link href={`/${courseRow.slug}/${moduleRow.slug}`}>{moduleRow.title}</Link>
      </nav>
      <h1>{lessonRow.title}</h1>
      {lessonRow.summary && <p><em>{lessonRow.summary}</em></p>}
      {lessonRow.content_html
        ? <article dangerouslySetInnerHTML={{ __html: lessonRow.content_html }} />
        : <pre style={{ whiteSpace: 'pre-wrap' }}>{lessonRow.content_md ?? ''}</pre>}
      {lessonRow.updated_at && (
        <p style={{ opacity: 0.7, marginTop: 16 }}>
          Last updated: {new Date(lessonRow.updated_at).toLocaleString()}
        </p>
      )}
    </main>
  );
}
