import { requireOwner } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { InviteForm } from './InviteForm';
import { UserRow } from './UserRow';

export const dynamic = 'force-dynamic';

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

export default async function TeamPage() {
  const { supabase, user, profile } = await requireOwner();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: true });

  const people = (profiles ?? []) as ProfileRow[];

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb trail={[{ label: 'Admin', href: '/admin' }, { label: 'Team Access' }]} />
      <h1>Team Access</h1>
      <p className="admin-hint">
        Invite people and control who can reach the admin. <strong>Admins</strong> share your full
        view (including team access); <strong>HR Managers</strong> manage postings and staff but not
        team access. People sign in at <code>/admin/login</code> with <strong>Continue with Google</strong>,
        so invite the email address of their Google account (Gmail or Google Workspace). After
        inviting, send them the welcome message. It explains how to sign in and links to the
        Getting Started guide.
      </p>

      <InviteForm />

      <section className="admin-team-list">
        <h2>People</h2>
        <div className="admin-list">
          {people.map((p) => (
            <UserRow key={p.id} person={p} selfId={user.id} senderName={profile.full_name ?? null} />
          ))}
        </div>
      </section>
    </main>
  );
}
