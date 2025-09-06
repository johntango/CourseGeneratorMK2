// app/courses/page.tsx
import { supabaseAdmin } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

async function getCourses() {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, description, visibility, published, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function CoursesPage() {
  const rows = await getCourses();

  return (
    <main>
      <h1>Courses</h1>
      {rows.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <ul>
          {rows.map((c) => (
            <li key={c.id}>{c.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
