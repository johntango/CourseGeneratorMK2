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
  const parsed = courseUpsert.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? 'Invalid payload');

  const { slug, title, description, visibility, published } = parsed.data;
  const { error } = await supabaseAdmin
    .from('courses')
    .upsert({ slug, title, description, visibility, published }, { onConflict: 'slug' });

  if (error) return serverError(error.message);
  return ok({ ok: true });
}
