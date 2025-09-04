'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';

type Course = { id: string; slug: string; title: string };
type Module = { slug: string; title: string };
type Lesson = { slug: string; title: string };

type Props = {
  courses: Course[];
  action: (formData: FormData) => Promise<void>; // server action passed from page
};

export default function TriageForm({ courses, action }: Props) {
  const [scope, setScope] = useState<'course'|'module'|'lesson'>('course');
  const [courseSlug, setCourseSlug] = useState('');
  const [moduleSlug, setModuleSlug] = useState('');
  const [lessonSlug, setLessonSlug] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isPending, startTransition] = useTransition();

  // fetch modules when course changes
  useEffect(() => {
    setModuleSlug('');
    setLessonSlug('');
    setLessons([]);
    if (!courseSlug) { setModules([]); return; }
    fetch(`/api/triage/modules/${encodeURIComponent(courseSlug)}`)
      .then(r => r.json())
      .then(d => setModules(d.modules ?? []))
      .catch(() => setModules([]));
  }, [courseSlug]);

  // fetch lessons when module changes
  useEffect(() => {
    setLessonSlug('');
    if (!courseSlug || !moduleSlug) { setLessons([]); return; }
    fetch(`/api/triage/lessons/${encodeURIComponent(courseSlug)}/${encodeURIComponent(moduleSlug)}`)
      .then(r => r.json())
      .then(d => setLessons(d.lessons ?? []))
      .catch(() => setLessons([]));
  }, [courseSlug, moduleSlug]);

  const showModule = scope === 'module' || scope === 'lesson';
  const showLesson = scope === 'lesson';

  // We use a controlled <form> but still submit to the server action.
  return (
    <form
      action={(fd) => startTransition(() => action(fd))}
      style={{ display: 'grid', gap: 12 }}
    >
      <fieldset>
        <legend>Scope</legend>
        <label><input type="radio" name="scope" value="course" checked={scope==='course'} onChange={() => setScope('course')} /> Course</label>{' '}
        <label><input type="radio" name="scope" value="module" checked={scope==='module'} onChange={() => setScope('module')} /> Module</label>{' '}
        <label><input type="radio" name="scope" value="lesson" checked={scope==='lesson'} onChange={() => setScope('lesson')} /> Lesson</label>
      </fieldset>

      <label>
        Course
        <select name="course" required value={courseSlug} onChange={e => setCourseSlug(e.target.value)}>
          <option value="" disabled>Choose a course…</option>
          {courses.map(c => (
            <option key={c.id} value={c.slug}>{c.title} ({c.slug})</option>
          ))}
        </select>
      </label>

      {showModule && (
        <label>
          Module
          <select name="module" required={showModule} value={moduleSlug} onChange={e => setModuleSlug(e.target.value)}>
            <option value="" disabled>{modules.length ? 'Choose a module…' : 'No modules'}</option>
            {modules.map(m => (
              <option key={m.slug} value={m.slug}>{m.title} ({m.slug})</option>
            ))}
          </select>
        </label>
      )}

      {showLesson && (
        <label>
          Lesson
          <select name="lesson" required={showLesson} value={lessonSlug} onChange={e => setLessonSlug(e.target.value)}>
            <option value="" disabled>{lessons.length ? 'Choose a lesson…' : 'No lessons'}</option>
            {lessons.map(l => (
              <option key={l.slug} value={l.slug}>{l.title} ({l.slug})</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Instructions to Triage Agent
        <textarea name="prompt" rows={6} placeholder="Be explicit: what should change and how?" required />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Applying…' : 'Apply via Triage Agent'}
      </button>
    </form>
  );
}
