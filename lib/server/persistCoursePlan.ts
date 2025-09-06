import { supabaseAdmin } from '@/lib/server/supabase';
import type { TCoursePlan } from '@/lib/validation/course-plan';

export async function persistCoursePlan(courseId: string, plan: TCoursePlan) {
  for (let i = 0; i < plan.modules.length; i++) {
    const m = plan.modules[i];
    const { data: modRow, error: mErr } = await supabaseAdmin
      .from('modules')
      .upsert(
        { course_id: courseId, slug: m.slug, title: m.title, position: i + 1 },
        { onConflict: 'course_id,slug' }
      )
      .select('id')
      .maybeSingle();
    if (mErr) throw new Error(`Module upsert failed: ${m.title} - ${mErr.message}`);
    if (!modRow) throw new Error(`Module upsert returned no row for ${m.title}`);

    for (let j = 0; j < m.lessons.length; j++) {
      const l = m.lessons[j];
      const { error: lErr } = await supabaseAdmin
        .from('lessons')
        .upsert(
          {
            module_id: modRow.id,
            slug: l.slug,
            title: l.title,
            summary: l.summary ?? '',
            position: j + 1,
            published: false,
          },
          { onConflict: 'module_id,slug' }
        );
      if (lErr) throw new Error(`Lesson upsert failed: ${m.title}/${l.title} - ${lErr.message}`);
    }
  }
}
