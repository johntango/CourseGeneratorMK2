// Disable caching for this page
export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';

export default async function CoursePage({ params : { params: { course: string } } }) {
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('slug', params.course)
    .maybeSingle();
  if (!course) return <main>Not found</main>;

  const { data: modules, error } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', course.id)
    .order('position', { ascending: true });

  if (error) return <main>Error: {error.message}</main>;

  return (
    <main>
      <h2>{course.title}</h2>
      <h3>Modules</h3>
      {(!modules || modules.length === 0) ? (
        <p>No modules found.</p>
      ) : (
        <ul>
          {modules.map((m: any) => (
            <li key={m.id}>
              <Link href={`/${params.course}/${m.slug}`}>{m.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
