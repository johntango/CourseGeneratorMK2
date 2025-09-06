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
  // ✅ define rows here
  const rows = await getCourses();

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <h1 className="me-auto mb-0">Courses</h1>
        {/* create/edit buttons go here */}
      </div>

      <div className="card bg-body">
        <div className="card-body">
          {!rows.length ? (
            <div className="alert alert-info mb-0">
              No courses yet — create one to get started.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Visibility</th>
                    <th>Published</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td><code>{c.slug}</code></td>
                      <td>{c.visibility}</td>
                      <td>{c.published ? 'Yes' : 'No'}</td>
                      <td>{new Date(c.created_at).toLocaleString()}</td>
                      <td className="text-end">
                        {/* buttons/links for view/edit here */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
