import { z } from 'zod';

export const coursePlan = z.object({
  course: z.object({
    title: z.string().min(1),
    description: z.string().optional().default(''),
    level: z.enum(['intro', 'intermediate', 'advanced']).default('intro'),
  }),
  modules: z.array(
    z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      lessons: z.array(
        z.object({
          slug: z.string().min(1),
          title: z.string().min(1),
          summary: z.string().optional().default(''),
        })
      ),
    })
  ),
});

export type CoursePlan = z.infer<typeof coursePlan>;
