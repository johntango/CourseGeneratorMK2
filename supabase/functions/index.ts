// Deno deployable
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const authz = req.headers.get('authorization') ?? '';
  const srvKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (!authz.startsWith('Bearer ') || authz.slice(7) !== srvKey) {
    return new Response('Forbidden', { status: 403 });
  }

  const email = new URL(req.url).searchParams.get('email');
  if (!email) return new Response('email required', { status: 400 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, srvKey);
  const { error } = await admin.rpc('promote_admin', { target_email: email });
  if (error) return new Response(error.message, { status: 500 });
  return new Response('ok');
});
