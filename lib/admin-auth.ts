import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Guard for admin pages: requires a signed-in, ACTIVE profile. Inactive or
 *  missing profiles are sent to /admin (which shows the "pending" screen);
 *  unauthenticated users go to the login. Returns the client + user + profile. */
export async function requireActiveStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) redirect('/admin');

  return { supabase, user, profile };
}

/** Guard for owner-only pages (team access). Non-owners are sent to /admin. */
export async function requireOwner() {
  const { supabase, user, profile } = await requireActiveStaff();
  if (profile.role !== 'owner') redirect('/admin');
  return { supabase, user, profile };
}
