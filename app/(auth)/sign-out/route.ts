// app/auth/sign-out/route.ts
import { supabaseServer } from '@/lib/supabase-server';
export async function POST() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return new Response(null, { status: 204 });
}
