import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { PostingRow } from './PostingRow';
import type { JobPostingRow } from '@/lib/job-postings';

export const dynamic = 'force-dynamic';

export default async function PostingsPage() {
  const { supabase } = await requireActiveStaff();
  const { data: postings } = await supabase
    .from('job_postings')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  const rows = (postings ?? []) as JobPostingRow[];

  return (
    <main className="admin-wrap">
      <div className="admin-subhead">
        <Link href="/admin" className="admin-back">← Admin</Link>
        <Link href="/admin/postings/new" className="btn btn-warm btn-sm">+ New posting</Link>
      </div>
      <h1>Job Postings</h1>
      <p className="admin-hint">
        Active postings appear on the public <Link href="/careers">careers page</Link>. Drafts stay
        hidden until you publish them.
      </p>

      {rows.length === 0 ? (
        <div className="admin-empty">No postings yet. Create one to publish it to the careers page.</div>
      ) : (
        <div className="admin-list">
          {rows.map((p) => (
            <PostingRow key={p.id} posting={p} />
          ))}
        </div>
      )}
    </main>
  );
}
