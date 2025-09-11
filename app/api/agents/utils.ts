import slugify from 'slugify';


export function toSlug(s: string) {
return slugify(s, { lower: true, strict: true, trim: true });
}


export type Prompt = {
course_title: string;
course_level: 'undergraduate'|'graduate'|'secondary'|string;
source_style: string; // e.g., 'project-based'
learner_level: string; // e.g., 'calculus-ready'
};