import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { StaffForm } from '@/app/admin/staff/StaffForm';
import type { StaffRow } from '@/lib/staff-data';

export const dynamic = 'force-dynamic';

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireActiveStaff();
  const { data } = await supabase.from('staff').select('*').eq('id', id).single();
  if (!data) notFound();

  return (
    <main className="admin-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Staff', href: '/admin/staff' },
          { label: data.full_name, href: `/admin/staff/${id}` },
          { label: 'Edit' },
        ]}
      />
      <h1>Edit Profile</h1>
      <StaffForm staff={data as StaffRow} />
    </main>
  );
}
