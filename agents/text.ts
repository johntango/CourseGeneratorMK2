import { Prompt } from './util';


export type LessonText = { title: string; summary: string; content_md: string };


export async function textAgent(prompt: Prompt, lessonTitle: string): Promise<LessonText> {
const md = `## ${lessonTitle}\n\n**Level:** ${prompt.course_level} — **Style:** ${prompt.source_style}\n\n### Concept\nBrief exposition tailored to ${prompt.learner_level}.\n\n### Worked Example\nSolve a small problem illustrating the concept.\n\n### Check Your Understanding\n- Question 1\n- Question 2\n`;
return { title: lessonTitle, summary: `Overview of ${lessonTitle}`, content_md: md };
}