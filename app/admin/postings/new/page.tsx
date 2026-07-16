import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { PostingForm } from '../PostingForm';

export default async function NewPostingPage() {
  await requireActiveStaff();
  return (
    <main className="admin-wrap admin-form-wrap">
      <Link href="/admin/postings" className="admin-back">← Postings</Link>
      <h1>New Posting</h1>
      <PostingForm />
    </main>
  );
}
