'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }
  return (
    <button onClick={signOut} className="btn btn-outline admin-signout" type="button">
      Sign out
    </button>
  );
}
