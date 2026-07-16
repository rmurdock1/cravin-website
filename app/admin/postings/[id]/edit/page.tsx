import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { PostingForm } from '../../PostingForm';
import type { JobPostingRow } from '@/lib/job-postings';

export default async function EditPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireActiveStaff();
  const { data: posting } = await supabase.from('job_postings').select('*').eq('id', id).single();
  if (!posting) notFound();

  return (
    <main className="admin-wrap admin-form-wrap">
      <Link href="/admin/postings" className="admin-back">← Postings</Link>
      <h1>Edit Posting</h1>
      <PostingForm posting={posting as JobPostingRow} />
    </main>
  );
}
