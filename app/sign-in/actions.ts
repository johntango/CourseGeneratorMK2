// app/sign-in/actions.ts
'use server';
import { supabaseServer } from '@/lib/supabase-server';

export async function sendMagicLink(email: string) {
  const supabase = await supabaseServer();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, '');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,  // absolute, HTTPS
    },
  });

  if (error) throw new Error(error.message);
  return { ok: true };
}
