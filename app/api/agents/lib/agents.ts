import { z } from 'zod';
import { Agent, run, tool, OpenAIResponsesModel } from '@openai/agents';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const modelOrch   = new OpenAIResponsesModel({ client: openai, model: process.env.OPENAI_MODEL_ORCH    ?? 'gpt-4o-mini' });
const modelModule = new OpenAIResponsesModel({ client: openai, model: process.env.OPENAI_MODEL_MODULES ?? 'gpt-4o-mini' });
const modelLesson = new OpenAIResponsesModel({ client: openai, model: process.env.OPENAI_MODEL_LESSONS ?? 'gpt-4o-mini' });

// Shared schemas
const ModulePlan = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  position: z.number().int().min(1),
});
const LessonPlan = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().min(1),
  objectives: z.string().min(1),
  content: z.string().min(200),
});

// === Specialist agents (each can run standalone or be used as a tool)
const ModuleAgent = new Agent({
  name: 'ModuleAgent',
  model: modelModule,
  instructions:
    'You produce course module outlines ONLY as valid JSON. No commentary, no markdown.',
});

const LessonAgent = new Agent({
  name: 'LessonAgent',
  model: modelLesson,
  instructions:
    'You write clear instructional lesson text & objectives as valid JSON. No HTML, no commentary.',
});

// Wrap specialists as tools (so other agents can call them)
const GenerateModules = ModuleAgent.asTool({
  toolName: 'generate_modules',
  toolDescription: 'Propose a module outline for a course.',
  inputSchema: z.object({
    title: z.string(),
    level: z.enum(['intro','intermediate','advanced']),
    style: z.string(),
    learnerLevel: z.string().optional(),
    n: z.number().int().min(2).max(8).default(4),
  }),
  outputSchema: z.object({ modules: z.array(ModulePlan).min(1) }),
});

const GenerateLessons = LessonAgent.asTool({
  toolName: 'generate_lessons',
  toolDescription: 'Draft lessons with objectives and text for one module.',
  inputSchema: z.object({
    courseTitle: z.string(),
    module: ModulePlan,
    level: z.enum(['intro','intermediate','advanced']),
    style: z.string(),
    learnerLevel: z.string().optional(),
    n: z.number().int().min(1).max(6).default(2),
    targetWords: z.number().int().min(300).max(2500).default(900),
  }),
  outputSchema: z.object({ lessons: z.array(LessonPlan).min(1) }),
});

// DB write as a tool (so the orchestrator can persist)
const PersistContent = tool({
  name: 'persist_course_content',
  description: 'Insert modules and lessons into Supabase.',
  parameters: z.object({
    courseId: z.string().uuid(),
    modules: z.array(ModulePlan).optional(),
    lessonsByModuleSlug: z.record(z.string(), z.array(LessonPlan)).optional(),
  }),
  async function({ courseId, modules, lessonsByModuleSlug }) {
    let modulesInserted = 0; let lessonsInserted = 0;

    if (modules?.length) {
      for (const m of modules) {
        const { error } = await supabaseAdmin.from('modules').insert({
          course_id: courseId, slug: m.slug, title: m.title, description: m.description, position: m.position,
        });
        if (error) throw new Error(`Insert module failed: ${error.message}`);
        modulesInserted++;
      }
    }

    if (lessonsByModuleSlug) {
      for (const [moduleSlug, lessons] of Object.entries(lessonsByModuleSlug)) {
        const { data: mod } = await supabaseAdmin
          .from('modules').select('id').eq('course_id', courseId).eq('slug', moduleSlug).single();
        if (!mod) throw new Error(`Module ${moduleSlug} not found`);

        for (const L of lessons) {
          const { error } = await supabaseAdmin.from('lessons').insert({
            module_id: mod.id, slug: L.slug, title: L.title, position: L.position,
            objectives: L.objectives, content: L.content,
          });
          if (error) throw new Error(`Insert lesson failed: ${error.message}`);
          lessonsInserted++;
        }
      }
    }

    return { modulesInserted, lessonsInserted };
  },
});

// Orchestrator agent that can call the three tools
export const Orchestrator = new Agent({
  name: 'CourseOrchestrator',
  model: modelOrch,
  instructions:
    'Plan modules, then for each module plan lessons, then persist results. Use tools; do not fabricate JSON manually.',
  tools: [GenerateModules, GenerateLessons, PersistContent],
});

// Helper the runner will call
export async function runCourseGeneration(opts: {
  courseId: string; courseTitle: string;
  level: 'intro'|'intermediate'|'advanced';
  style: string; learnerLevel?: string;
}) {
  // 1) Ask orchestrator to generate modules (via tool)
  const modCall = await run(
    Orchestrator,
    `Generate modules for "${opts.courseTitle}" with level=${opts.level}, style=${opts.style}.`,
    { tool: GenerateModules, toolInput: { title: opts.courseTitle, level: opts.level, style: opts.style, learnerLevel: opts.learnerLevel, n: 4 } }
  );
  const modules = modCall.toolOutput.modules;

  // 2) For each module, generate lessons
  const lessonsByModuleSlug: Record<string, z.infer<typeof LessonPlan>[]> = {};
  for (const m of modules.sort((a,b)=>a.position-b.position)) {
    const lessonCall = await run(
      Orchestrator,
      `Generate ${2} lessons for module "${m.title}".`,
      { tool: GenerateLessons, toolInput: {
        courseTitle: opts.courseTitle, module: m, level: opts.level, style: opts.style,
        learnerLevel: opts.learnerLevel, n: 2, targetWords: 900
      } }
    );
    lessonsByModuleSlug[m.slug] = lessonCall.toolOutput.lessons;
  }

  // 3) Persist in one shot
  const persistCall = await run(
    Orchestrator,
    `Persist all generated modules and lessons.`,
    { tool: PersistContent, toolInput: { courseId: opts.courseId, modules, lessonsByModuleSlug } }
  );

  return {
    modules: modules.map(m => m.slug),
    counts: persistCall.finalOutput ?? persistCall.toolOutput, // { modulesInserted, lessonsInserted }
  };
}
