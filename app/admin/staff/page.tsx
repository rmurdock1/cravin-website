import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { LOCATIONS, STAFF_STATUSES, labelFor, locationsLabel, type StaffRow } from '@/lib/staff-data';
import { createDraftStaff } from './actions';
import { DiscardDraftButton } from './DiscardDraftButton';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const { supabase } = await requireActiveStaff();
  const { data } = await supabase
    .from('staff')
    .select('id, full_name, job_title, locations, status, email, phone, created_at')
    .order('full_name');

  const rows = (data ?? []) as (StaffRow & { created_at: string })[];
  // Saved profiles have a name; nameless rows are Add Staff drafts that were
  // never saved. Drafts stay out of the directory and counts, but are listed
  // below so they (and anything uploaded to them) can be continued or deleted.
  const staff = rows.filter((p) => p.full_name);
  const drafts = rows
    .filter((p) => !p.full_name)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const { data: draftDocs } = drafts.length
    ? await supabase.from('staff_documents').select('staff_id').in('staff_id', drafts.map((d) => d.id))
    : { data: [] as { staff_id: string }[] };
  const docCount = (id: string) => (draftDocs ?? []).filter((d) => d.staff_id === id).length;

  // Buckets for both the headcount summary and the grouped directory below.
  // Current team only (exclude 'former'); single-store staff count at their store,
  // anyone at 2+ stores is a floater — so buckets never double-count. Former staff
  // are kept in their own group so they stay reachable without skewing the counts.
  const current = staff.filter((p) => p.status !== 'former');
  const inStore = (v: string) =>
    current.filter((p) => (p.locations ?? []).length === 1 && p.locations![0] === v);

  const groups = [
    ...LOCATIONS.map((l) => ({ key: l.value, label: l.label, members: inStore(l.value) })),
    { key: 'floating', label: 'Floating', members: current.filter((p) => (p.locations ?? []).length >= 2) },
    { key: 'unassigned', label: 'Unassigned', members: current.filter((p) => (p.locations ?? []).length === 0) },
    { key: 'former', label: 'Former', members: staff.filter((p) => p.status === 'former') },
  ];

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb trail={[{ label: 'Admin', href: '/admin' }, { label: 'Staff' }]} />
      <div className="admin-page-head">
        <div>
          <h1>Staff</h1>
          <p className="admin-hint">
            Your team. Click <strong>Add Staff</strong> to add someone, or click a profile to edit
            or remove them.
          </p>
        </div>
        <form action={createDraftStaff}>
          <button type="submit" className="btn btn-warm">Add Staff</button>
        </form>
      </div>

      {current.length > 0 && (
        <section className="admin-stat-row" aria-label="Team by location">
          {LOCATIONS.map((l) => (
            <div key={l.value} className="admin-stat">
              <span className="admin-stat-num">{inStore(l.value).length}</span>
              <span className="admin-stat-label">{l.label}</span>
            </div>
          ))}
          <div className="admin-stat admin-stat-accent">
            <span className="admin-stat-num">
              {current.filter((p) => (p.locations ?? []).length >= 2).length}
            </span>
            <span className="admin-stat-label">Floating</span>
          </div>
        </section>
      )}

      {drafts.length > 0 && (
        <section className="admin-drafts" aria-label="Unsaved drafts">
          <h2 className="admin-group-heading">
            Unsaved drafts <span className="admin-group-count">{drafts.length}</span>
          </h2>
          <p className="admin-hint">
            Add Staff profiles that were never saved. Continue one, or delete it along with anything
            uploaded to it.
          </p>
          <div className="admin-list">
            {drafts.map((d) => {
              const count = docCount(d.id);
              return (
                <div key={d.id} className="admin-list-row">
                  <div className="admin-list-main">
                    <div className="admin-list-title">Unsaved profile</div>
                    <div className="admin-list-meta">
                      Started{' '}
                      {new Date(d.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'America/New_York',
                      })}
                      {' · '}
                      {count === 0 ? 'No documents' : count === 1 ? '1 document' : `${count} documents`}
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <Link href={`/admin/staff/${d.id}/edit`} className="admin-mini">Continue</Link>
                    <DiscardDraftButton id={d.id} documentCount={count} compact />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {staff.length === 0 ? (
        <div className="admin-empty">
          <p>No staff profiles yet.</p>
          <form action={createDraftStaff}>
            <button type="submit" className="btn btn-warm">Add your first</button>
          </form>
        </div>
      ) : (
        <div className="admin-staff-directory">
          {groups
            .filter((g) => g.members.length > 0)
            .map((g) => (
              <section key={g.key} className={`admin-staff-group ${g.key === 'former' ? 'is-former' : ''}`}>
                <h2 className="admin-group-heading">
                  {g.label} <span className="admin-group-count">{g.members.length}</span>
                </h2>
                <div className="admin-list">
                  {g.members.map((p) => (
                    <Link key={p.id} href={`/admin/staff/${p.id}`} className="admin-list-row admin-list-link">
                      <div className="admin-list-main">
                        <div className="admin-list-title">{p.full_name}</div>
                        <div className="admin-list-meta">
                          {p.job_title || 'No title'}
                          {/* Floaters: show which stores. Single-store groups: store is the heading. */}
                          {(p.locations ?? []).length >= 2 ? ` · ${locationsLabel(p.locations)}` : ''}
                          {p.email ? ` · ${p.email}` : ''}
                        </div>
                      </div>
                      <span className={`admin-badge ${p.status === 'active' ? 'on' : 'off'}`}>
                        {labelFor(STAFF_STATUSES, p.status)}
                      </span>
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
