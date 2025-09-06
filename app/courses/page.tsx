'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Course = { id:string; slug:string; title:string; description:string|null; visibility:'public'|'private'; published:boolean; created_at:string };

export default function CoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|undefined>();
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/courses', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed');
        setRows(json.courses);
      } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3">
        <h1 className="me-auto">Courses</h1>
        <CreateCourse />
      </div>
      {!rows.length ? <div className="alert alert-info">No courses yet.</div> : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead><tr><th>Title</th><th>Slug</th><th>Visibility</th><th>Published</th><th>Created</th><th/></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td><code>{r.slug}</code></td>
                  <td>{r.visibility}</td>
                  <td>{r.published?'Yes':'No'}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td className="text-end">
                    <Link className="btn btn-sm btn-outline-primary me-2" href={`/${r.slug}`}>View</Link>
                    <EditCourse initial={r} onSaved={() => location.reload()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function slugify(s: string){ return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-'); }

function CreateCourse(){
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({
      title: body.title, slug: body.slug, description: body.description, visibility: body.visibility === 'private' ? 'private' : 'public', published: !!body.published
    })});
    if (!res.ok) alert((await res.json()).error || 'Failed'); else location.reload();
  };
  const [title, setTitle] = useState('');
  const slug = slugify(title);
  return (
    <form className="d-flex gap-2" onSubmit={onSubmit}>
      <input className="form-control" placeholder="Course title" name="title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <input className="form-control" placeholder="slug" name="slug" value={slug} readOnly />
      <button className="btn btn-primary" type="submit">Add</button>
    </form>
  );
}

function EditCourse({ initial, onSaved }:{ initial: Course; onSaved: ()=>void }){
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [slug,  setSlug]  = useState(initial.slug);
  const [visibility, setVisibility] = useState<'public'|'private'>(initial.visibility);
  const [published, setPublished] = useState<boolean>(!!initial.published);
  const [description, setDescription] = useState(initial.description ?? '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/courses/${initial.id}`, {
      method: 'PATCH', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ title, slug, visibility, published, description })
    });
    if (!res.ok) alert((await res.json()).error || 'Failed');
    else { setOpen(false); onSaved(); }
  };

  return (
    <>
      <button className="btn btn-sm btn-outline-secondary" onClick={()=>setOpen(true)}>Edit</button>
      {open && (
        <div className="modal d-block" tabIndex={-1}>
          <div className="modal-dialog"><div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Course</h5>
                <button type="button" className="btn-close" onClick={()=>setOpen(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-2"><label className="form-label">Title</label>
                  <input className="form-control" value={title} onChange={e=>{ setTitle(e.target.value); }} /></div>
                <div className="mb-2"><label className="form-label">Slug</label>
                  <input className="form-control" value={slug} onChange={e=>setSlug(e.target.value)} /></div>
                <div className="mb-2"><label className="form-label">Description</label>
                  <textarea className="form-control" value={description} onChange={e=>setDescription(e.target.value)} rows={3} /></div>
                <div className="row g-3">
                  <div className="col">
                    <label className="form-label">Visibility</label>
                    <select className="form-select" value={visibility} onChange={e=>setVisibility(e.target.value as any)}>
                      <option value="public">public</option>
                      <option value="private">private</option>
                    </select>
                  </div>
                  <div className="col d-flex align-items-end">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id={`pub-${initial.id}`} checked={published} onChange={e=>setPublished(e.target.checked)} />
                      <label className="form-check-label" htmlFor={`pub-${initial.id}`}>Published</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={()=>setOpen(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Save</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </>
  );
}
