import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { LOCATIONS, STAFF_STATUSES, labelFor, locationsLabel, type StaffRow } from '@/lib/staff-data';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const { supabase } = await requireActiveStaff();
  const { data } = await supabase
    .from('staff')
    .select('id, full_name, job_title, locations, status, email, phone')
    .order('full_name');

  const staff = (data ?? []) as StaffRow[];

  // Headcount by store. Current team only (exclude 'former'). Someone assigned to
  // a single store counts there; anyone at 2+ stores is counted once as a floater
  // instead — so the buckets don't double-count.
  const current = staff.filter((p) => p.status !== 'former');
  const perStore = Object.fromEntries(LOCATIONS.map((l) => [l.value, 0])) as Record<string, number>;
  let floaters = 0;
  let unassigned = 0;
  for (const p of current) {
    const locs = p.locations ?? [];
    if (locs.length === 0) unassigned++;
    else if (locs.length === 1) perStore[locs[0]] = (perStore[locs[0]] ?? 0) + 1;
    else floaters++;
  }

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb trail={[{ label: 'Admin', href: '/admin' }, { label: 'Staff' }]} />
      <div className="admin-page-head">
        <div>
          <h1>Staff</h1>
          <p className="admin-hint">
            Profiles and secure documents. Files are stored in a private bucket and opened
            through short-lived links — every view is recorded in the audit log.
          </p>
        </div>
        <Link href="/admin/staff/new" className="btn btn-warm">Add Staff</Link>
      </div>

      {current.length > 0 && (
        <section className="admin-stat-row" aria-label="Team by location">
          {LOCATIONS.map((l) => (
            <div key={l.value} className="admin-stat">
              <span className="admin-stat-num">{perStore[l.value]}</span>
              <span className="admin-stat-label">{l.label}</span>
            </div>
          ))}
          <div className="admin-stat admin-stat-accent">
            <span className="admin-stat-num">{floaters}</span>
            <span className="admin-stat-label">Floating</span>
          </div>
          {unassigned > 0 && (
            <div className="admin-stat admin-stat-muted">
              <span className="admin-stat-num">{unassigned}</span>
              <span className="admin-stat-label">Unassigned</span>
            </div>
          )}
        </section>
      )}

      {staff.length === 0 ? (
        <div className="admin-empty">
          <p>No staff profiles yet.</p>
          <Link href="/admin/staff/new" className="btn btn-warm">Add your first</Link>
        </div>
      ) : (
        <div className="admin-list">
          {staff.map((p) => (
            <Link key={p.id} href={`/admin/staff/${p.id}`} className="admin-list-row admin-list-link">
              <div className="admin-list-main">
                <div className="admin-list-title">{p.full_name}</div>
                <div className="admin-list-meta">
                  {p.job_title || 'No title'} · {locationsLabel(p.locations)}
                  {p.email ? ` · ${p.email}` : ''}
                </div>
              </div>
              <span className={`admin-badge ${p.status === 'active' ? 'on' : 'off'}`}>
                {labelFor(STAFF_STATUSES, p.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
