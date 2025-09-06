'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

const LEVELS = ['intro', 'intermediate', 'advanced'] as const;
type Level = typeof LEVELS[number];

export default function CreateCourseButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const slug = useMemo(() => slugify(title), [title]);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [published, setPublished] = useState(true);

  // NEW: generation controls
  const [generate, setGenerate] = useState(true);
  const [level, setLevel] = useState<Level>('intro');
  const [style, setStyle] = useState<string>('project-based');

  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          description,
          visibility,
          published,
          generate,
          level,
          style,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create course');
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        New Course
      </button>

      {open && (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content bg-body">
              <form onSubmit={submit}>
                <div className="modal-header">
                  <h5 className="modal-title">Create Course</h5>
                  <button type="button" className="btn-close" onClick={() => setOpen(false)} />
                </div>

                <div className="modal-body">
                  {/* Basics */}
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g., Statistical Mechanics I"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Slug</label>
                    <input className="form-control" value={slug} readOnly />
                    <div className="form-text">Used in URLs; auto-generated from title.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional short description"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col">
                      <label className="form-label">Visibility</label>
                      <select
                        className="form-select"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as any)}
                      >
                        <option value="public">public</option>
                        <option value="private">private</option>
                      </select>
                    </div>
                    <div className="col d-flex align-items-end">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          id="create-published"
                          type="checkbox"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="create-published">
                          Published
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Generation options */}
                  <hr className="my-3" />
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      id="auto-generate"
                      type="checkbox"
                      checked={generate}
                      onChange={(e) => setGenerate(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="auto-generate">
                      Auto-generate modules & lessons
                    </label>
                  </div>

                  <div className="row g-3">
                    <div className="col">
                      <label className="form-label">Level</label>
                      <select
                        className="form-select"
                        value={level}
                        onChange={(e) => setLevel(e.target.value as any)}
                        disabled={!generate}
                      >
                        {LEVELS.map((lv) => (
                          <option key={lv} value={lv}>{lv}</option>
                        ))}
                      </select>
                      <div className="form-text">Target rigor and prerequisites.</div>
                    </div>
                    <div className="col">
                      <label className="form-label">Style</label>
                      <input
                        className="form-control"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="e.g., project-based, proof-first, lab-centric"
                        disabled={!generate}
                      />
                      <div className="form-text">Pedagogical style or constraints.</div>
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
