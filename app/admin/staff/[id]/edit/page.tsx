import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { StaffForm } from '@/app/admin/staff/StaffForm';
import type { StaffRow, StaffDocumentRow } from '@/lib/staff-data';

export const dynamic = 'force-dynamic';

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireActiveStaff();

  const { data } = await supabase.from('staff').select('*').eq('id', id).single();
  if (!data) notFound();

  const [{ data: titles }, { data: docs }] = await Promise.all([
    supabase.from('job_titles').select('title').order('title'),
    supabase
      .from('staff_documents')
      .select('id, staff_id, file_name, doc_type, mime_type, size_bytes, created_at')
      .eq('staff_id', id)
      .order('created_at', { ascending: false }),
  ]);
  const titleOptions = (titles ?? []).map((t) => t.title as string);

  // An empty name means this is a freshly created draft → "Add Staff".
  const isNew = !data.full_name;

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Staff', href: '/admin/staff' },
          isNew
            ? { label: 'Add' }
            : { label: data.full_name, href: `/admin/staff/${id}` },
          ...(isNew ? [] : [{ label: 'Edit' }]),
        ]}
      />
      <h1>{isNew ? 'Add Staff' : 'Edit Profile'}</h1>
      {isNew && (
        <p className="admin-hint">
          Upload a document below and press <strong>Scan ✨</strong> to pre-fill from it, or just
          type the details in. Everything saves together.
        </p>
      )}
      <StaffForm
        staff={data as StaffRow}
        titleOptions={titleOptions}
        documents={(docs ?? []) as StaffDocumentRow[]}
      />
    </main>
  );
}
