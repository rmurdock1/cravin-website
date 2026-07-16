import { notFound } from 'next/navigation';
import { requireActiveStaff } from '@/lib/admin-auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { TemplateForm } from '@/app/admin/postings/TemplateForm';
import type { JobTemplateRow } from '@/lib/job-postings';

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireActiveStaff();
  const { data: template } = await supabase.from('job_templates').select('*').eq('id', id).single();
  if (!template) notFound();

  return (
    <main className="admin-wrap admin-form-wrap">
      <AdminBreadcrumb
        trail={[
          { label: 'Admin', href: '/admin' },
          { label: 'Job Postings', href: '/admin/postings' },
          { label: 'Edit Template' },
        ]}
      />
      <h1>Edit Template</h1>
      <TemplateForm template={template as JobTemplateRow} />
    </main>
  );
}
