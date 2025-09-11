// app/[course]/[module]/page.tsx
import { supabaseAdmin } from '@/lib/server/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params }: { params: { course: string; module: string } }) {
  const { data: course } = await supabaseAdmin.from('courses').select('id, slug, title').eq('slug', params.course).single();
  if (!course) return <div className="container py-4">Course not found</div>;

  const { data: mod } = await supabaseAdmin.from('modules').select('id, slug, title').eq('course_id', course.id).eq('slug', params.module).single();
  if (!mod) return <div className="container py-4">Module not found</div>;

  const { data: lessons } = await supabaseAdmin
    .from('lessons')
    .select('id, slug, title, position')
    .eq('module_id', mod.id)
    .order('position', { ascending: true });

  return (
    <main className="container py-4">
      <h1 className="h4 mb-3">{mod.title}</h1>
      {!lessons?.length ? (
        <div className="text-secondary">No lessons yet.</div>
      ) : (
        <ul className="list-group">
          {lessons!.map(L => (
            <li key={L.id} className="list-group-item bg-body d-flex justify-content-between">
              <span>{L.title}</span>
              <Link href={`/${course.slug}/${mod.slug}/${L.slug}`} className="btn btn-outline-secondary btn-sm">Open</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
