import { supabaseAdmin } from '@/lib/server/supabase';
import { ok, badRequest, serverError } from '@/lib/server/http';
import { generateCoursePlan } from '@/agents/generateCoursePlan';
import { persistCoursePlan } from '@/lib/server/persist-course-plan';

type Params = { course: string }; // slug

export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { course } = await ctx.params;

  const { data: c, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, description')
    .eq('slug', course)
    .maybeSingle();
  if (cErr) return serverError(cErr.message);
  if (!c)   return badRequest('course not found');

  const { level, style } = await req.json().catch(() => ({} as any)) as {
    level?: 'intro'|'intermediate'|'advanced';
    style?: string;
  };

  try {
    const plan = await generateCoursePlan({
      title: c.title,
      description: c.description ?? undefined,
      level: level ?? 'intro',
      style
    });
    await persistCoursePlan(c.id, plan);
    return ok({ ok: true, modules: plan.modules.length });
  } catch (e: any) {
    return serverError(e?.message ?? 'generation failed');
  }
}
