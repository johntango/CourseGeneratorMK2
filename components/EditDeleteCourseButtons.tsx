// components/EditDeleteCourseButtons.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  visibility: 'public' | 'private';
  published: boolean;
};

export default function EditDeleteCourseButtons({ initial }: { initial: Course }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description ?? '');
  const [visibility, setVisibility] = useState<'public' | 'private'>(initial.visibility);
  const [published, setPublished] = useState<boolean>(!!initial.published);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(initial.slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, description, visibility, published }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to update');
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete course “${initial.title}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(initial.slug)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to delete');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(true)}>
        Edit
      </button>
      <button className="btn btn-sm btn-outline-danger" onClick={remove} disabled={deleting}>
        {deleting ? 'Deleting…' : 'Delete'}
      </button>

      {open && (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content bg-body">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Course</h5>
                  <button type="button" className="btn-close" onClick={() => setOpen(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Slug</label>
                    <input className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                    <div className="form-text">Changing slug changes the URL.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col">
                      <label className="form-label">Visibility</label>
                      <select className="form-select" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                        <option value="public">public</option>
                        <option value="private">private</option>
                      </select>
                    </div>
                    <div className="col d-flex align-items-end">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          id={`published-${initial.id}`}
                          type="checkbox"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`published-${initial.id}`}>Published</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
