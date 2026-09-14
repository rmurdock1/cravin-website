import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already signed in (e.g. sent here by a stale or repeated sign-in attempt):
  // skip the form. /admin shows its own "pending" screen for inactive accounts.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/admin');

  const { error } = await searchParams;
  return (
    <main className="admin-login-wrap">
      <LoginForm initialError={error} />
    </main>
  );
}
