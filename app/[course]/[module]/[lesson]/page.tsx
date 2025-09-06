// app/[course]/[module]/[lesson]/page.tsx
import { supabaseAdmin } from '@/lib/server/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

type params = { course: string; module: string; lesson: string };

async function getScopedLesson({ course, module: mod, lesson }: Params) {
  // 1) Course
  const { data: c, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title')
    .eq('slug', course)
    .maybeSingle();
  if (cErr || !c) return null;

  // 2) Module
  const { data: m, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', c.id)
    .eq('slug', mod)
    .maybeSingle();
  if (mErr || !m) return null;

  // 3) Lesson
  const { data: l, error: lErr } = await supabaseAdmin
    .from('lessons')
    .select('id, slug, title, summary, content_html, content_md, published, position, updated_at')
    .eq('module_id', m.id)
    .eq('slug', lesson)
    .maybeSingle();
  if (lErr || !l) return null;

  return { course: c, module: m, lesson: l };
}

export default async function LessonPage({ params }: { params: params }) {
  const scoped = await getScopedLesson(params);
  if (!scoped) return notFound();

  const { course, module: mod, lesson } = scoped;

  return (
    <main>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/courses">Courses</Link></li>
          <li className="breadcrumb-item"><Link href={`/${course.slug}`}>{course.title}</Link></li>
          <li className="breadcrumb-item"><Link href={`/${course.slug}/${mod.slug}`}>{mod.title}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{lesson.title}</li>
        </ol>
      </nav>

      <div className="d-flex align-items-center mb-3">
        <h1 className="me-auto mb-0">{lesson.title}</h1>
        <span className="badge text-bg-secondary">{lesson.published ? 'Published' : 'Draft'}</span>
      </div>

      {lesson.summary ? <p className="text-muted">{lesson.summary}</p> : null}

      <div className="card bg-body shadow-sm">
        <div className="card-body">
          {lesson.content_html ? (
            <article dangerouslySetInnerHTML={{ __html: lesson.content_html }} />
          ) : lesson.content_md ? (
            <pre className="mb-0">{lesson.content_md}</pre>
          ) : (
            <div className="alert alert-info mb-0">No content yet. Use Triage to add material.</div>
          )}
        </div>
      </div>

      <div className="mt-3 text-muted small">
        Updated {lesson.updated_at ? new Date(lesson.updated_at).toLocaleString() : '—'}
      </div>
    </main>
  );
}
