import { supabaseAdmin } from '@/lib/server/supabase';
import type { CoursePlan } from '@/lib/validation/course-plan';

export async function persistCoursePlan(courseId: string, plan: CoursePlan) {
  for (let i = 0; i < plan.modules.length; i++) {
    const m = plan.modules[i];
    const { data: modRow } = await supabaseAdmin
      .from('modules')
      .upsert({ course_id: courseId, slug: m.slug, title: m.title, position: i + 1 }, { onConflict: 'course_id,slug' })
      .select('id')
      .maybeSingle();

    if (!modRow) continue;

    for (let j = 0; j < m.lessons.length; j++) {
      const l = m.lessons[j];
      await supabaseAdmin.from('lessons').upsert(
        {
          module_id: modRow.id,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          position: j + 1,
        },
        { onConflict: 'module_id,slug' }
      );
    }
  }
}
