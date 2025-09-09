// app/(admin)/layout.tsx
import { supabaseServer } from '@/lib/supabase-server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;

  const { data: profile } = await supabase
    .from('profiles')
    .select('global_role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !['instructor','admin'].includes(profile.global_role)) {
    return <div>Forbidden</div>;
  }
  return <>{children}</>;
}
