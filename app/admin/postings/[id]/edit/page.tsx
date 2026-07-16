import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { PostingForm } from '../../PostingForm';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import type { JobPostingRow } from '@/lib/job-postings';

export default async function EditPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireActiveStaff();
  const { data: posting } = await supabase.from('job_postings').select('*').eq('id', id).single();
  if (!posting) notFound();

  return (
    <main className="admin-wrap admin-form-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Job Postings', href: '/admin/postings' },
          { label: 'Edit' },
        ]}
      />
      <h1>Edit Posting</h1>
      <PostingForm editingId={id} initial={posting as JobPostingRow} />
    </main>
  );
}
