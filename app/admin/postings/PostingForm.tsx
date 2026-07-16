'use client';

import Link from 'next/link';
import { savePosting } from './actions';
import { JOB_LOCATIONS, EMPLOYMENT_TYPES, type JobPostingRow } from '@/lib/job-postings';

export function PostingForm({ posting }: { posting?: JobPostingRow }) {
  return (
    <form action={savePosting} className="admin-form">
      {posting && <input type="hidden" name="id" value={posting.id} />}

      <label>
        Title *
        <input name="title" required defaultValue={posting?.title ?? ''} placeholder="e.g. Cashier / Front of House" />
      </label>

      <div className="admin-form-row">
        <label>
          Location *
          <select name="location" defaultValue={posting?.location ?? 'All Locations'} required>
            {JOB_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          Employment type
          <select name="employment_type" defaultValue={posting?.employment_type ?? 'full-time'}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Description *
        <textarea name="description" rows={3} required defaultValue={posting?.description ?? ''} />
      </label>
      <label>
        Responsibilities <span className="admin-form-hint">(one per line)</span>
        <textarea name="responsibilities" rows={4} defaultValue={(posting?.responsibilities ?? []).join('\n')} />
      </label>
      <label>
        Requirements <span className="admin-form-hint">(one per line)</span>
        <textarea name="requirements" rows={4} defaultValue={(posting?.requirements ?? []).join('\n')} />
      </label>
      <label>
        Perks <span className="admin-form-hint">(one per line, optional)</span>
        <textarea name="perks" rows={3} defaultValue={(posting?.perks ?? []).join('\n')} />
      </label>

      <div className="admin-form-row">
        <label className="admin-check">
          <input type="checkbox" name="is_active" defaultChecked={posting?.is_active ?? false} />
          Publish to the careers page now
        </label>
        <label className="admin-sort">
          Sort order
          <input type="number" name="sort_order" defaultValue={posting?.sort_order ?? 0} />
        </label>
      </div>

      <div className="admin-form-actions">
        <Link href="/admin/postings" className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-warm">{posting ? 'Save changes' : 'Create posting'}</button>
      </div>
    </form>
  );
}
