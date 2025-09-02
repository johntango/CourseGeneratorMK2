import { NextRequest, NextResponse } from 'next/server';


// Create course
const { data: course, error: cErr } = await supabaseAdmin
.from('courses')
.upsert({ slug: courseSlug, title: prompt.course_title, description: payload.description ?? null, published: true }, { onConflict: 'slug' })
.select('*')
.single();
if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });


// Outline
const outline = await outlineAgent(prompt);


// Insert modules & lessons synchronously (MVP)
let positionModule = 1;
for (const mod of outline.modules) {
const { data: module, error: mErr } = await supabaseAdmin
.from('modules')
.upsert({ course_id: course.id, slug: mod.slug, title: mod.title, position: positionModule++ }, { onConflict: 'course_id,slug' })
.select('*')
.single();
if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });


let positionLesson = 1;
for (const les of mod.lessons) {
const text = await textAgent(prompt, les.title);
const img = await imageAgent(les.title);
const html = `
<h3>${text.title}</h3>
<p><em>${text.summary}</em></p>
<img src="${img.url}" alt="${img.alt}" style="max-width:100%;margin:12px 0;" />
${text.content_md.split('\n').map(p => `<p>${p}</p>`).join('\n')}
`;


const { error: lErr } = await supabaseAdmin.from('lessons').upsert({
module_id: module.id,
slug: les.slug,
title: text.title,
summary: text.summary,
content_md: text.content_md,
content_html: html,
published: true,
position: positionLesson++
}, { onConflict: 'module_id,slug' });
if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });
}
}


return NextResponse.json({ ok: true, course_slug: courseSlug });
}