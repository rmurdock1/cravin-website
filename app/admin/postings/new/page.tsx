import Link from 'next/link';
import { requireActiveStaff } from '@/lib/admin-auth';
import { PostingForm } from '../PostingForm';
import { TemplatePicker } from '../TemplatePicker';
import type { JobPostingRow } from '@/lib/job-postings';

export default async function NewPostingPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { supabase } = await requireActiveStaff();
  const { template } = await searchParams;

  const { data: templates } = await supabase
    .from('job_templates')
    .select('id, name')
    .order('created_at', { ascending: false });

  let initial: Partial<JobPostingRow> | undefined;
  if (template) {
    const { data: t } = await supabase
      .from('job_templates')
      .select('*')
      .eq('id', template)
      .single();
    if (t) {
      initial = {
        title: t.title ?? '',
        location: t.location ?? 'All Locations',
        employment_type: t.employment_type,
        description: t.description ?? '',
        responsibilities: t.responsibilities ?? [],
        requirements: t.requirements ?? [],
        perks: t.perks ?? [],
      };
    }
  }

  return (
    <main className="admin-wrap admin-form-wrap">
      <Link href="/admin/postings" className="admin-back">← Postings</Link>
      <h1>New Posting</h1>
      <TemplatePicker templates={templates ?? []} selected={template} />
      <PostingForm initial={initial} />
    </main>
  );
}
