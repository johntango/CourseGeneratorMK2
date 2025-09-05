//triage/page.tsx
// 
import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';

export const revalidate = 60; // ISR: refresh every minute

export default async function Home() {
  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, description, created_at, published, visibility')
    .eq('published', true)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) return <pre>Failed to load courses: {error.message}</pre>;

  return (
    <main style={{ maxWidth: 880, margin: '0 auto' }}>
      <h1>Courses</h1>
      <ul>
        {(courses ?? []).map((c) => (
          <li key={c.id} style={{ margin: '12px 0' }}>
            <Link href={`/${c.slug}`}><b>{c.title}</b></Link>
            {c.description ? <div>{c.description}</div> : null}
          </li>
        ))}
      </ul>
      {!courses?.length && <p>No courses yet. Generate one via <code>POST /api/generate</code>.</p>}
    </main>
  );
}
