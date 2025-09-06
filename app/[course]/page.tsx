// app/[course]/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';

// While developing you can also add: export const dynamic = 'force-dynamic';

export default async function CoursePage(
  { params }: { params: { course: string } }
) {
  const { course } = await params;

  const { data: courseRow, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('slug', course)
    .maybeSingle();

  if (cErr) return <main>Error: {cErr.message}</main>;
  if (!courseRow) return <main>Not found</main>;

  const { data: modules, error: mErr } = await supabaseAdmin
    .from('modules')
    .select('id, slug, title, position')
    .eq('course_id', courseRow.id)
    .order('position', { ascending: true });

  if (mErr) return <main>Error: {mErr.message}</main>;

  return (
    <main>
      <h2>{courseRow.title}</h2>
      <h3>Modules</h3>
      {(!modules || modules.length === 0) ? (
        <p>No modules found.</p>
      ) : (
        <ul>
          {modules.map((m) => (
            <li key={m.id}>
              <Link href={`/${course}/${m.slug}`}>{m.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
