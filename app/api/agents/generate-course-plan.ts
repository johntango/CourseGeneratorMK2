import { coursePlan, type CoursePlan } from '@/lib/validation/course-plan';

export async function generateCoursePlan(input: {
  title: string;
  description?: string;
  level?: 'intro' | 'intermediate' | 'advanced';
  style?: string;
}): Promise<CoursePlan> {
  const draft = {
    course: { title: input.title, description: input.description ?? '', level: input.level ?? 'intro' },
    modules: [
      {
        slug: 'foundations',
        title: 'Foundations',
        lessons: [{ slug: 'intro', title: 'Introduction', summary: '' }],
      },
    ],
  };

  return coursePlan.parse(draft);
}
