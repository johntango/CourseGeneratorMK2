import { createClient } from '@supabase/supabase-js';
let url = process.env.SUPABASE_URL;
let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("GOT Supabase URL:", url);
console.log("GOT Supabase Key:", key ? key.substring(0, 4) + '...' : 'undefined');
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
