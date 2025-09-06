import { CoursePlan, type TCoursePlan } from '@/lib/validation/course-plan';

export async function generateCoursePlan(input: {
  title: string;
  description?: string;
  level?: 'intro'|'intermediate'|'advanced';
  style?: string; // e.g., 'project-based'
}): Promise<TCoursePlan> {
  // TODO: replace with your real multi-agent orchestration
  const safeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');

  const level = input.level ?? 'intro';
  const style = (input.style ?? 'project-based').toLowerCase();

  // Simple shaping heuristics for MVP:
  const introLessons = [
    { slug: 'introduction', title: 'Introduction', summary: '' },
    { slug: 'key-concepts', title: 'Key Concepts', summary: '' },
  ];
  const intermediateLessons = [
    { slug: 'review-and-prerequisites', title: 'Review & Prerequisites', summary: '' },
    { slug: 'techniques-and-methods', title: 'Techniques & Methods', summary: '' },
    { slug: 'worked-examples', title: 'Worked Examples', summary: '' },
  ];
  const advancedLessons = [
    { slug: 'theory-and-derivations', title: 'Theory & Derivations', summary: '' },
    { slug: 'frontier-topics', title: 'Frontier Topics', summary: '' },
    { slug: 'case-studies', title: 'Case Studies', summary: '' },
  ];

  const pick = level === 'advanced' ? advancedLessons : level === 'intermediate' ? intermediateLessons : introLessons;

  const styleModule =
    style.includes('project') ? { slug: 'project', title: 'Capstone Project', lessons: [{ slug: 'proposal', title: 'Project Proposal', summary: '' }, { slug: 'implementation', title: 'Implementation', summary: '' }, { slug: 'presentation', title: 'Presentation', summary: '' }] }
    : style.includes('proof') ? { slug: 'proof-techniques', title: 'Proof Techniques', lessons: [{ slug: 'axioms', title: 'Axioms & Structures', summary: '' }, { slug: 'theorems', title: 'Core Theorems', summary: '' }, { slug: 'proof-writing', title: 'Proof Writing', summary: '' }] }
    : style.includes('lab') ? { slug: 'lab', title: 'Lab Exercises', lessons: [{ slug: 'lab-setup', title: 'Lab Setup', summary: '' }, { slug: 'experiments', title: 'Experiments', summary: '' }, { slug: 'reporting', title: 'Reporting', summary: '' }] }
    : { slug: 'applications', title: 'Applications', lessons: [{ slug: 'worked-examples', title: 'Worked Examples', summary: '' }, { slug: 'case-study', title: 'Case Study', summary: '' }] };

  const draft = {
    course: {
      title: input.title,
      description: input.description ?? '',
      level,
    },
    modules: [
      { slug: 'foundations', title: 'Foundations', lessons: pick },
      styleModule,
    ],
  };

  const plan = CoursePlan.parse(draft);
  plan.modules.forEach(m => {
    m.slug = safeSlug(m.slug);
    m.lessons.forEach(l => { l.slug = safeSlug(l.slug); });
  });
  return plan;
}
