import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';


export default async function CoursePage({ params }: { params: { course: string } }) {
const { data: course } = await supabaseAdmin.from('courses').select('*').eq('slug', params.course).maybeSingle();
if (!course) return <div>Not found</div>;
const { data: modules } = await supabaseAdmin.from('modules').select('*').eq('course_id', course.id).order('position');
return (
<main>
<h2>{course.title}</h2>
<p>{course.description ?? ''}</p>
<h3>Modules</h3>
<ul>
{(modules ?? []).map((m: any) => (
<li key={m.id}><Link href={`/${params.course}/${m.slug}`}>{m.title}</Link></li>
))}
</ul>
</main>
);
}