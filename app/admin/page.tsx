import Link from 'next/link';
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

  // Applications HR hasn't opened yet. A failed query just means no badge.
  const { count: newApplicants } = await supabase
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .is('viewed_at', null)
    .is('staff_id', null);

  return (
    <main className="admin-wrap">
      <header className="admin-header">
        <div>
          <h1>Cravin Admin</h1>
          <p className="admin-user">
            {profile.full_name || user.email} ·{' '}
            <span className="admin-role">{profile.role === 'owner' ? 'Admin' : 'HR Manager'}</span>
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="admin-cards">
        <Link href="/admin/postings" className="admin-card admin-card-link">
          <h2>Job Postings →</h2>
          <p>Create and manage location-specific openings that publish straight to the public careers page.</p>
        </Link>
        <Link href="/admin/applicants" className="admin-card admin-card-link">
          <h2>
            Applicants →
            {newApplicants ? <span className="admin-card-count">{newApplicants} new</span> : null}
          </h2>
          <p>Everyone who applies on the careers page. Read resumes, keep notes, and hire straight into Staff.</p>
        </Link>
        <Link href="/admin/staff" className="admin-card admin-card-link">
          <h2>Staff →</h2>
          <p>Team profiles and secure documents — I-9s, offer letters and certifications in private storage.</p>
        </Link>
        {profile.role === 'owner' && (
          <Link href="/admin/team" className="admin-card admin-card-link">
            <h2>Team Access →</h2>
            <p>Invite people, and activate, revoke, or change their access at any time.</p>
          </Link>
        )}
      </div>
    </main>
  );
}
