'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { savePosting, saveTemplate } from './actions';
import { BulletListInput } from '@/components/admin/BulletListInput';
import { JOB_LOCATIONS, EMPLOYMENT_TYPES, type JobPostingRow } from '@/lib/job-postings';

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  flexible: 'Flexible',
};

export function PostingForm({
  editingId,
  initial,
}: {
  editingId?: string;
  initial?: Partial<JobPostingRow>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [templateMsg, setTemplateMsg] = useState('');
  const isLive = !!initial?.is_active;

  function submit(intent: 'save' | 'publish' | 'unpublish') {
    const form = formRef.current;
    if (!form) return;
    if (intent === 'publish' && !confirm('This posting will go LIVE on the public careers page. Continue?')) return;
    if (intent === 'unpublish' && !confirm('This will remove the posting from the public careers page. Continue?')) return;
    (form.elements.namedItem('intent') as HTMLInputElement).value = intent;
    form.requestSubmit();
  }

  async function handleSaveTemplate() {
    const form = formRef.current;
    if (!form) return;
    if (!(form.elements.namedItem('title') as HTMLInputElement).value.trim()) {
      alert('Add a job title before saving a template.');
      return;
    }
    const name = window.prompt('Name this template (e.g. "Cashier — standard"):');
    if (!name) return;
    const fd = new FormData(form);
    fd.set('template_name', name);
    await saveTemplate(fd);
    setTemplateMsg('Template saved ✓');
    setTimeout(() => setTemplateMsg(''), 3000);
  }

  return (
    <form ref={formRef} action={savePosting} className="admin-form">
      {editingId && <input type="hidden" name="id" value={editingId} />}
      <input type="hidden" name="intent" defaultValue="save" />
      <input type="hidden" name="current_active" value={isLive ? 'true' : 'false'} />

      <label>
        Job title *
        <input name="title" required defaultValue={initial?.title ?? ''} placeholder="e.g. Cashier / Front of House" />
      </label>

      <div className="admin-form-row">
        <label>
          Location *
          <select name="location" defaultValue={initial?.location ?? 'All Locations'} required>
            {JOB_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          Employment type
          <select name="employment_type" defaultValue={initial?.employment_type ?? 'full-time'}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Short description *
        <textarea name="description" rows={3} required defaultValue={initial?.description ?? ''} placeholder="One or two sentences about the role." />
      </label>

      <BulletListInput name="responsibilities" label="Responsibilities" initial={initial?.responsibilities} placeholder="e.g. Greet customers and take orders" />
      <BulletListInput name="requirements" label="Requirements" initial={initial?.requirements} placeholder="e.g. Weekend availability" />
      <BulletListInput name="perks" label="Perks" hint="(optional)" initial={initial?.perks} placeholder="e.g. Free shift meals" />

      <div className="admin-template-bar">
        <button type="button" className="admin-mini" onClick={handleSaveTemplate}>Save as template</button>
        {templateMsg && <span className="admin-template-msg">{templateMsg}</span>}
      </div>

      <div className="admin-form-actions">
        <Link href="/admin/postings" className="btn btn-outline">Cancel</Link>
        <button type="button" className="btn btn-outline-warm" onClick={() => submit('save')}>
          {editingId ? 'Save changes' : 'Save as draft'}
        </button>
        {isLive ? (
          <button type="button" className="btn btn-warm" onClick={() => submit('unpublish')}>Unpublish</button>
        ) : (
          <button type="button" className="btn btn-warm" onClick={() => submit('publish')}>Publish posting</button>
        )}
      </div>
    </form>
  );
}
