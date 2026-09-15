'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { updateTemplate } from './actions';
import { BulletListInput } from '@/components/admin/BulletListInput';
import { JOB_LOCATIONS, EMPLOYMENT_TYPES, type JobTemplateRow } from '@/lib/job-postings';

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  flexible: 'Flexible',
};

export function TemplateForm({ template }: { template: JobTemplateRow }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Submitted from code (not <form action>) so a failed save keeps the edits;
  // see PostingForm. Success redirects back to Job Postings.
  function save() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const res = await updateTemplate(fd);
      if (res && !res.ok) setError(res.message);
    });
  }

  return (
    <form
      ref={formRef}
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <input type="hidden" name="id" value={template.id} />

      <label>
        Template name *
        <input name="template_name" required defaultValue={template.name} placeholder='e.g. "Cashier — standard"' />
      </label>
      <label>
        Job title
        <input name="title" defaultValue={template.title ?? ''} placeholder="e.g. Cashier / Front of House" />
      </label>

      <div className="admin-form-row">
        <label>
          Location
          <select name="location" defaultValue={template.location ?? 'All Locations'}>
            {JOB_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          Employment type
          <select name="employment_type" defaultValue={template.employment_type}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Short description
        <textarea name="description" rows={3} defaultValue={template.description ?? ''} />
      </label>

      <BulletListInput name="responsibilities" label="Responsibilities" initial={template.responsibilities} />
      <BulletListInput name="requirements" label="Requirements" initial={template.requirements} />
      <BulletListInput name="perks" label="Perks" hint="(optional)" initial={template.perks} />

      <div className="admin-form-actions">
        {error && !saving && <p className="admin-error admin-save-error" role="alert">{error}</p>}
        <Link href="/admin/postings" className="btn btn-outline">Cancel</Link>
        <button type="button" className="btn btn-warm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save template'}
        </button>
      </div>
    </form>
  );
}
