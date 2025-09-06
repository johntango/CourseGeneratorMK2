import { supabaseAdmin } from '@/lib/server/supabase';
import { ok, badRequest, serverError } from '@/lib/server/http';
import { courseUpsert } from '@/lib/validation/schema';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim();
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id, slug, title, description, visibility, published, created_at')
    .order('created_at', { ascending: false });

  if (error) return serverError(error.message);
  let filtered = data ?? [];
  if (search) {
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    );
  }
  return ok({ courses: filtered });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Validate base course fields
  const parsed = courseUpsert.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? 'Invalid payload');

  const {
    slug, title, description, visibility, published
  } = parsed.data as {
    slug: string; title: string;
    description?: string | null; visibility: 'public'|'private'; published: boolean;
  };

  // Read generation extras (optional)
  const generate = typeof (body as any).generate === 'boolean' ? Boolean((body as any).generate) : false;
  const level = (body as any).level as ('intro'|'intermediate'|'advanced'|undefined);
  const style = (body as any).style as (string|undefined);

  const { error } = await supabaseAdmin
    .from('courses')
    .upsert(
      { slug, title, description: description ?? null, visibility, published },
      { onConflict: 'slug' }
    );
  if (error) return serverError(error.message);

  if (generate) {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || '';
    // Fire-and-forget so UI isn’t blocked
    fetch(`${origin}/api/courses/${encodeURIComponent(slug)}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, style }),
    }).catch(() => void 0);
  }

  return ok({ ok: true, enqueued: generate, level: level ?? null, style: style ?? null });
}
