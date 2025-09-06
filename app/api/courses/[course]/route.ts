import { supabaseAdmin } from '@/lib/server/supabase';
import { ok, badRequest, serverError } from '@/lib/server/http';
type Params = { course: string };

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  const { course } = await ctx.params;       // slug
  const body = await req.json().catch(() => ({}));
  const { data: c, error: cErr } = await supabaseAdmin.from('courses').select('id').eq('slug', course).maybeSingle();
  if (cErr) return serverError(cErr.message);
  if (!c)   return badRequest('course not found');
  const { error } = await supabaseAdmin.from('courses').update(body).eq('id', c.id);
  if (error) return serverError(error.message);
  return ok({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const { course } = await ctx.params;
  const { data: c, error: cErr } = await supabaseAdmin.from('courses').select('id').eq('slug', course).maybeSingle();
  if (cErr) return serverError(cErr.message);
  if (!c)   return badRequest('course not found');
  const { error } = await supabaseAdmin.from('courses').delete().eq('id', c.id);
  if (error) return serverError(error.message);
  return ok({ ok: true });
}
