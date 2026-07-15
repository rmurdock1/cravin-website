import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/admin/SignOutButton';

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // A user may always read their own profile (RLS: profiles_select_own).
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active')
    .eq('id', user.id)
    .single();

  // Signed in but not yet activated by an owner.
  if (!profile || !profile.is_active) {
    return (
      <main className="admin-wrap">
        <div className="admin-pending">
          <h1>Access pending</h1>
          <p>
            You&apos;re signed in as <strong>{user.email}</strong>, but your account
            isn&apos;t active yet. An owner needs to grant you access before you can
            manage HR.
          </p>
          <SignOutButton />
        </div>
      </main>
    );
  }

  return (
    <main className="admin-wrap">
      <header className="admin-header">
        <div>
          <h1>Cravin Admin</h1>
          <p className="admin-user">
            {profile.full_name || user.email} · <span className="admin-role">{profile.role}</span>
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="admin-cards">
        <div className="admin-card">
          <h2>Job Postings</h2>
          <p>Create and manage location-specific openings that publish straight to the public careers page.</p>
          <span className="admin-soon">Coming next</span>
        </div>
        {profile.role === 'owner' && (
          <div className="admin-card">
            <h2>Team Access</h2>
            <p>Invite the HR manager, and activate or revoke access at any time.</p>
            <span className="admin-soon">Coming next</span>
          </div>
        )}
      </div>
    </main>
  );
}
