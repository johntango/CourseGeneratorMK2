// components/TriageForm.tsx
'use client';

import { useState } from 'react';

type Course = { id: string; slug: string; title: string };
export default function TriageForm({
  courses,
  action,
}: {
  courses: Course[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [scope, setScope] = useState<'course'|'module'|'lesson'>('course');

  return (
    <form action={action} className="row g-3">
      {/* Scope */}
      <div className="col-12 col-md-4">
        <label htmlFor="scope" className="form-label">Scope</label>
        <select
          id="scope"
          name="scope"
          className="form-select"
          value={scope}
          onChange={(e) => setScope(e.target.value as any)}
        >
          <option value="course">Course</option>
          <option value="module">Module</option>
          <option value="lesson">Lesson</option>
        </select>
      </div>

      {/* Course */}
      <div className="col-12 col-md-8">
        <label htmlFor="course" className="form-label">Course</label>
        <select id="course" name="course" className="form-select">
          {courses.map(c => <option key={c.id} value={c.slug}>{c.title}</option>)}
        </select>
      </div>

      {/* Optional module/lesson slugs */}
      <div className="col-12 col-md-6">
        <label htmlFor="module" className="form-label">Module (optional)</label>
        <input id="module" name="module" type="text" className="form-control" placeholder="module-slug" />
      </div>
      <div className="col-12 col-md-6">
        <label htmlFor="lesson" className="form-label">Lesson (optional)</label>
        <input id="lesson" name="lesson" type="text" className="form-control" placeholder="lesson-slug" />
      </div>

      {/* PROMPT — FULL-WIDTH ROW */}
      <div className="col-12">
        <label htmlFor="prompt" className="form-label">Prompt</label>

        {/* Key changes:
            1) place in .col-12 so it spans the full row
            2) make control full-width (Bootstrap .w-100 is implicit for .form-control, but we add it explicitly)
            3) give it a comfortable min-height and allow horizontal growth with style maxWidth: '100%' */}
        <textarea
          id="prompt"
          name="prompt"
          className="form-control w-100"
          rows={8}
          style={{ minHeight: 160, maxWidth: '100%' }}
          placeholder="Describe what to triage/change. Include constraints, tone, and examples if useful."
          required
        />
        {/* If you prefer Tailwind: className="w-full min-h-[160px] form-control" (keep Bootstrap's form-control look) */}
      </div>

      <div className="col-12 d-flex gap-2">
        <button type="submit" className="btn btn-primary">Run triage</button>
        <button type="reset" className="btn btn-outline-secondary">Reset</button>
      </div>
    </form>
  );
}
