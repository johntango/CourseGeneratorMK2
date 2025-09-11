// app/[course]/[module]/[lesson]/page.tsx
import { supabaseAdmin } from '@/lib/server/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

type Params = { course: string; module: string; lesson: string };

async function getScopedLesson(course: string, mod: string, lesson: string) {
  // 1) course
  const { data: courseRow } = await supabaseAdmin
    .from('courses')
    .select('id, title, slug')
    .eq('slug', course)
    .single();
  if (!courseRow) return null;

  // 2) module
  const { data: moduleRow } = await supabaseAdmin
    .from('modules')
    .select('id, title, slug')
    .eq('course_id', courseRow.id)
    .eq('slug', mod)
    .single();
  if (!moduleRow) return null;

  // 3) lesson
  const { data: lessonRow } = await supabaseAdmin
    .from('lessons')
    .select('id, title, slug, content, objectives, position, created_at')
    .eq('module_id', moduleRow.id)
    .eq('slug', lesson)
    .single();
  if (!lessonRow) return null;

  return { course: courseRow, module: moduleRow, lesson: lessonRow };
}

export default async function LessonPage({ params }: { params: Params }) {
  // DO NOT destructure in the signature of getScopedLesson
  const scoped = await getScopedLesson(params.course, params.module, params.lesson);
  if (!scoped) notFound();

  const { course, module, lesson } = scoped;
  return (
    <main className="container py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href={`/${course.slug}`}>{course.title}</Link></li>
          <li className="breadcrumb-item"><Link href={`/${course.slug}/${module.slug}`}>{module.title}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{lesson.title}</li>
        </ol>
      </nav>

      {lesson.objectives && (
        <>
          <h2 className="h6">Objectives</h2>
          <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{lesson.objectives}</p>
        </>
      )}

      <article style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</article>
    </main>
  );
}
