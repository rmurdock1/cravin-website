import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { DocumentManager } from '@/app/admin/staff/DocumentManager';
import { DeleteStaffButton } from '@/app/admin/staff/DeleteStaffButton';
import {
  LOCATIONS,
  EMPLOYMENT_TYPES,
  STAFF_STATUSES,
  labelFor,
  type StaffRow,
  type StaffDocumentRow,
} from '@/lib/staff-data';

export const dynamic = 'force-dynamic';

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="admin-detail">
      <span className="admin-detail-label">{label}</span>
      <span className="admin-detail-value">{value || '—'}</span>
    </div>
  );
}

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireActiveStaff();

  const { data } = await supabase.from('staff').select('*').eq('id', id).single();
  if (!data) notFound();
  const person = data as StaffRow;

  const { data: docs } = await supabase
    .from('staff_documents')
    .select('id, staff_id, file_name, doc_type, mime_type, size_bytes, created_at')
    .eq('staff_id', id)
    .order('created_at', { ascending: false });

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Staff', href: '/admin/staff' },
          { label: person.full_name },
        ]}
      />

      <div className="admin-page-head">
        <div>
          <h1>{person.full_name}</h1>
          <p className="admin-hint">
            {person.job_title || 'No title'} · {labelFor(LOCATIONS, person.location)} ·{' '}
            <span className={`admin-badge ${person.status === 'active' ? 'on' : 'off'}`}>
              {labelFor(STAFF_STATUSES, person.status)}
            </span>
          </p>
        </div>
        <div className="admin-list-actions">
          <Link href={`/admin/staff/${id}/edit`} className="btn btn-outline">Edit</Link>
          <DeleteStaffButton id={id} name={person.full_name} />
        </div>
      </div>

      <section className="admin-detail-grid">
        <Detail label="Email" value={person.email} />
        <Detail label="Phone" value={person.phone} />
        <Detail label="Employment" value={labelFor(EMPLOYMENT_TYPES, person.employment_type)} />
        <Detail label="Hire Date" value={person.hired_on} />
        <Detail label="Address" value={person.address} />
        <Detail label="Emergency Contact" value={person.emergency_contact_name} />
        <Detail label="Emergency Phone" value={person.emergency_contact_phone} />
        <Detail label="Notes" value={person.notes} />
      </section>

      <DocumentManager staffId={id} documents={(docs ?? []) as StaffDocumentRow[]} />
    </main>
  );
}
