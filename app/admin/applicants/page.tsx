import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { LOCATIONS, labelFor } from '@/lib/staff-data';
import { AVAILABILITY, formatAppliedDate, type ApplicationRow } from '@/lib/applicants-data';

export const dynamic = 'force-dynamic';

export default async function ApplicantsPage() {
  const { supabase } = await requireActiveStaff();
  const { data } = await supabase
    .from('job_applications')
    .select('id, full_name, email, position, preferred_location, availability, viewed_at, staff_id, created_at')
    .order('created_at', { ascending: false });

  const applications = (data ?? []) as ApplicationRow[];

  // Hired applicants get their own group; the rest split on whether HR has
  // opened them yet (opening one is what clears "New").
  const groups = [
    { key: 'new', label: 'New', members: applications.filter((a) => !a.staff_id && !a.viewed_at) },
    { key: 'reviewed', label: 'Reviewed', members: applications.filter((a) => !a.staff_id && a.viewed_at) },
    { key: 'hired', label: 'Hired', members: applications.filter((a) => a.staff_id) },
  ];

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb trail={[{ label: 'Admin', href: '/admin' }, { label: 'Applicants' }]} />
      <div className="admin-page-head">
        <div>
          <h1>Applicants</h1>
          <p className="admin-hint">
            Everyone who applies on the careers page, newest first. Click an applicant to see their
            resume, add notes, or hire them.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="admin-empty">
          <p>No applications yet. They&apos;ll show up here as soon as someone applies on the careers page.</p>
        </div>
      ) : (
        <div className="admin-staff-directory">
          {groups
            .filter((g) => g.members.length > 0)
            .map((g) => (
              <section key={g.key} className="admin-staff-group">
                <h2 className="admin-group-heading">
                  {g.label} <span className="admin-group-count">{g.members.length}</span>
                </h2>
                <div className="admin-list">
                  {g.members.map((a) => (
                    <Link key={a.id} href={`/admin/applicants/${a.id}`} className="admin-list-row admin-list-link">
                      <div className="admin-list-main">
                        <div className="admin-list-title">{a.full_name}</div>
                        <div className="admin-list-meta">
                          {a.position || 'General Application'}
                          {a.preferred_location ? ` · ${labelFor(LOCATIONS, a.preferred_location)}` : ''}
                          {a.availability ? ` · ${labelFor(AVAILABILITY, a.availability)}` : ''}
                          {` · Applied ${formatAppliedDate(a.created_at)}`}
                        </div>
                      </div>
                      {g.key === 'new' && <span className="admin-badge new">New</span>}
                      {g.key === 'hired' && <span className="admin-badge on">Hired</span>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </main>
  );
}
