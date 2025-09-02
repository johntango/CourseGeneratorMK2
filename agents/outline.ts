import { Prompt } from './util';


export type Outline = {
modules: { title: string; slug: string; lessons: { title: string; slug: string }[] }[];
};


export async function outlineAgent(prompt: Prompt): Promise<Outline> {
// MVP: deterministic, no LLM dependency; later, call your LLM and map output
const modules = [
{
title: 'Foundations',
slug: 'foundations',
lessons: [
{ title: 'Microstates and Macrostates', slug: 'microstates-macrostates' },
{ title: 'Entropy and Boltzmann', slug: 'entropy-boltzmann' }
]
},
{
title: 'Applications',
slug: 'applications',
lessons: [
{ title: 'Two-Level Systems', slug: 'two-level-systems' }
]
}
];
return { modules };
}