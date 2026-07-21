import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { StaffForm } from '../StaffForm';

export const dynamic = 'force-dynamic';

export default async function NewStaffPage() {
  await requireActiveStaff();
  return (
    <main className="admin-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Staff', href: '/admin/staff' },
          { label: 'New' },
        ]}
      />
      <h1>Add Staff</h1>
      <StaffForm />
    </main>
  );
}
