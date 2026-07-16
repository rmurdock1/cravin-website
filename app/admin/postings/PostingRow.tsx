'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { togglePosting, deletePosting } from './actions';
import type { JobPostingRow } from '@/lib/job-postings';

export function PostingRow({ posting }: { posting: JobPostingRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <div className="admin-list-title">
          {posting.title}
          <span className={`admin-badge ${posting.is_active ? 'on' : 'off'}`}>
            {posting.is_active ? 'Live' : 'Draft'}
          </span>
        </div>
        <div className="admin-list-meta">
          {posting.location} · {posting.employment_type}
        </div>
      </div>
      <div className="admin-list-actions">
        <button
          className="admin-mini"
          disabled={pending}
          onClick={() => startTransition(() => togglePosting(posting.id, !posting.is_active))}
        >
          {posting.is_active ? 'Unpublish' : 'Publish'}
        </button>
        <Link className="admin-mini" href={`/admin/postings/${posting.id}/edit`}>Edit</Link>
        <button
          className="admin-mini danger"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${posting.title}"? This can't be undone.`)) {
              startTransition(() => deletePosting(posting.id));
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
