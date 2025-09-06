import { z } from 'zod';

export const courseUpsert = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  visibility: z.enum(['public','private']).default('public'),
  published: z.boolean().default(true)
});

export const coursePatch = courseUpsert.partial().extend({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional()
});
