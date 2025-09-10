// app/sign-in/actions.ts
'use server';

import { supabaseServer } from '@/lib/supabase-server';

export async function sendMagicLink(email: string) {
  const supabase = await supabaseServer(); // <-- await the async helper

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) throw new Error(error.message);
  return { ok: true };
}
