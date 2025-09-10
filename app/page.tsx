import CreateCourseButton from '@/components/CreateCourseButton';
export default async function CoursesPage() {
  async function getCourses() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/courses`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load courses');
  const json = await res.json();
  return json.courses as Array<{ id:string; slug:string; title:string }>;
}


  const rows = await getCourses();

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <h1 className="me-auto mb-0">Courses</h1>
        <CreateCourseButton />
      </div>

      <div className="card bg-body shadow-sm">
        <div className="card-body">
          {!rows.length ? (
            <div className="alert alert-info mb-0">
              No courses yet — create one to get started.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
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
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="text-end d-flex gap-2 justify-content-end">
                        {/* Action buttons here */}
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
