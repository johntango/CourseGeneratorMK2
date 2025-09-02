import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';


export default async function LessonPage({ params }: { params: { course: string, module: string, lesson: string } }) {
const { data: course } = await supabaseAdmin.from('courses').select('id, title').eq('slug', params.course).maybeSingle();
if (!course) return <div>Not found</div>;
const { data: module } = await supabaseAdmin.from('modules').select('id, title').eq('course_id', course.id).eq('slug', params.module).maybeSingle();
if (!module) return <div>Not found</div>;
const { data: lesson } = await supabaseAdmin.from('lessons').select('*').eq('module_id', module.id).eq('slug', params.lesson).maybeSingle();
if (!lesson) return <div>Not found</div>;


return (
<main>
<nav style={{ marginBottom: 16 }}>
<Link href={`/${params.course}`}>← Back to course</Link>
</nav>
<h2>{lesson.title}</h2>
{lesson.content_html ? (
<article dangerouslySetInnerHTML={{ __html: lesson.content_html }} />
) : (
<pre>{lesson.content_md}</pre>
)}
</main>
);
}
