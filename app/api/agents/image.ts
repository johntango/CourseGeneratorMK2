export type ImageInfo = { alt: string; url: string };


export async function imageAgent(lessonTitle: string): Promise<ImageInfo> {
// MVP: placeholder image; later integrate generation or curated assets
return { alt: `${lessonTitle} illustration`, url: 'https://via.placeholder.com/800x400?text=Lesson+Figure' };
}