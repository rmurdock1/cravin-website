'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteTemplate } from './actions';

export function TemplateRow({ template }: { template: { id: string; name: string } }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <div className="admin-list-title">{template.name}</div>
      </div>
      <div className="admin-list-actions">
        <Link className="admin-mini" href={`/admin/postings/templates/${template.id}/edit`}>Edit</Link>
        <button
          className="admin-mini danger"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete template "${template.name}"? This can't be undone.`)) {
              startTransition(() => deleteTemplate(template.id));
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
