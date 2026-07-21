import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { LOCATIONS, STAFF_STATUSES, labelFor, type StaffRow } from '@/lib/staff-data';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const { supabase } = await requireActiveStaff();
  const { data } = await supabase
    .from('staff')
    .select('id, full_name, job_title, location, status, email, phone')
    .order('full_name');

  const staff = (data ?? []) as StaffRow[];

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
                  {p.job_title || 'No title'} · {labelFor(LOCATIONS, p.location)}
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
