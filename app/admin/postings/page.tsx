import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { PostingRow } from './PostingRow';
import { TemplateRow } from './TemplateRow';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import type { JobPostingRow } from '@/lib/job-postings';

export const dynamic = 'force-dynamic';

export default async function PostingsPage() {
  const { supabase } = await requireActiveStaff();
  const { data: postings } = await supabase
    .from('job_postings')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });
  const { data: templates } = await supabase
    .from('job_templates')
    .select('id, name')
    .order('created_at', { ascending: false });

  const rows = (postings ?? []) as JobPostingRow[];

  return (
    <main className="admin-wrap">
      <div className="admin-subhead">
        <AdminBreadcrumb trail={[{ label: 'Admin', href: '/admin' }, { label: 'Job Postings' }]} />
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

      {templates && templates.length > 0 && (
        <section className="admin-templates-section">
          <h2>Templates</h2>
          <p className="admin-hint">Reusable starting points — choose one when creating a new posting.</p>
          <div className="admin-list">
            {templates.map((t) => (
              <TemplateRow key={t.id} template={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
