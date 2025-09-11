// app/api/agents/_lib/generation.ts
import OpenAI from 'openai';
import { z } from 'zod';

export const ModulePlan = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  position: z.number().int().min(1),
});
export const ModulePlanArray = z.array(ModulePlan).min(1);

export const LessonPlan = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().min(1),
  objectives: z.string().min(1),
  content: z.string().min(200), // ensure non-trivial text
});
export const LessonPlanArray = z.array(LessonPlan).min(1);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function model(nameEnv: string, fallback: string) {
  return process.env[nameEnv] || fallback;
}

/** JSON-safe call with retries and schema validation */
async function completionsJson<T>(
  params: { system: string; user: string; model: string; schema: z.ZodType<T> },
  attempts = 2
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await openai.chat.completions.create({
        model: params.model,
        messages: [
          { role: 'system', content: params.system },
          { role: 'user', content: params.user },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });
      const raw = resp.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      const data = params.schema.parse(parsed);
      return data;
    } catch (e) {
      lastErr = e;
      // small backoff between attempts
      await new Promise(r => setTimeout(r, 350 + i * 200));
    }
  }
  throw lastErr;
}

export async function generateModules(opts: {
  title: string;
  level: 'intro' | 'intermediate' | 'advanced';
  style: string;           // e.g., "project-based"
  learnerLevel?: string;   // e.g., "undergrad"
  n?: number;              // target module count
}) {
  const n = Math.min(Math.max(opts.n ?? 4, 2), 8);
  const system = `You are a rigorous course design assistant. Produce strictly valid JSON matching the schema. Do not include commentary.`;
  const user = `
Course title: ${opts.title}
Rigor level: ${opts.level}
Style: ${opts.style}
Learner level: ${opts.learnerLevel ?? 'unspecified'}

Task: Propose ${n} modules as an array under key "modules".
Constraints:
- Provide concise, informative descriptions (1–2 sentences).
- Provide unique, URL-safe slugs (lowercase, hyphens).
- Positions are 1..N, sequential, no gaps.

JSON schema:
{
  "modules": ${ModulePlanArray.toString()}
}
`.trim();

  const data = await completionsJson(
    {
      system,
      user,
      model: model('OPENAI_MODEL_MODULES', 'gpt-4o-mini'),
      schema: z.object({ modules: ModulePlanArray }),
    },
    2
  );

  return data.modules;
}

export async function generateLessons(opts: {
  courseTitle: string;
  module: { slug: string; title: string; description: string; position: number };
  level: 'intro' | 'intermediate' | 'advanced';
  style: string;
  learnerLevel?: string;
  n?: number;              // lessons per module
  targetWords?: number;    // desired length per lesson
}) {
  const n = Math.min(Math.max(opts.n ?? 2, 1), 6);
  const words = Math.min(Math.max(opts.targetWords ?? 800, 300), 2500);
  const system = `You are a rigorous instructional writer. Return strictly valid JSON per schema. No commentary.`;
  const user = `
Course: ${opts.courseTitle}
Module: ${opts.module.title} — ${opts.module.description}
Rigor level: ${opts.level}
Style: ${opts.style}
Learner level: ${opts.learnerLevel ?? 'unspecified'}

Task: Propose ${n} lessons. Each lesson must include:
- slug (url-safe, lowercase, hyphens)
- title
- position (1..N, sequential)
- objectives (succinct paragraph)
- content (~${words} words of clear, well-structured instructional text; include headings where helpful; no HTML)

Return JSON with key "lessons" matching schema:
{
  "lessons": ${LessonPlanArray.toString()}
}
`.trim();

  const data = await completionsJson(
    {
      system,
      user,
      model: model('OPENAI_MODEL_LESSONS', 'gpt-4o-mini'),
      schema: z.object({ lessons: LessonPlanArray }),
    },
    2
  );

  return data.lessons;
}
