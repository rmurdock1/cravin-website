'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveStaff } from './actions';
import {
  LOCATIONS,
  EMPLOYMENT_TYPES,
  STAFF_STATUSES,
  type StaffRow,
} from '@/lib/staff-data';

export function StaffForm({ staff }: { staff?: StaffRow }) {
  const [saving, setSaving] = useState(false);

  return (
    <form action={saveStaff} onSubmit={() => setSaving(true)} className="admin-form">
      {staff && <input type="hidden" name="id" value={staff.id} />}

      <div className="admin-form-grid">
        <div className="admin-field">
          <label htmlFor="full_name">Full Name *</label>
          <input id="full_name" name="full_name" required defaultValue={staff?.full_name ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="job_title">Job Title</label>
          <input id="job_title" name="job_title" defaultValue={staff?.job_title ?? ''} placeholder="e.g. Line Cook" />
        </div>
        <div className="admin-field">
          <label htmlFor="location">Location</label>
          <select id="location" name="location" defaultValue={staff?.location ?? ''}>
            <option value="">Select…</option>
            {LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="employment_type">Employment Type</label>
          <select id="employment_type" name="employment_type" defaultValue={staff?.employment_type ?? ''}>
            <option value="">Select…</option>
            {EMPLOYMENT_TYPES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={staff?.status ?? 'active'}>
            {STAFF_STATUSES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="hired_on">Hire Date</label>
          <input type="date" id="hired_on" name="hired_on" defaultValue={staff?.hired_on ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" defaultValue={staff?.email ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" defaultValue={staff?.phone ?? ''} />
        </div>
        <div className="admin-field full">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" defaultValue={staff?.address ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="emergency_contact_name">Emergency Contact</label>
          <input id="emergency_contact_name" name="emergency_contact_name" defaultValue={staff?.emergency_contact_name ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="emergency_contact_phone">Emergency Phone</label>
          <input id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={staff?.emergency_contact_phone ?? ''} />
        </div>
        <div className="admin-field full">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={staff?.notes ?? ''} />
        </div>
      </div>

      <p className="admin-hint admin-privacy-note">
        Do not enter Social Security numbers or dates of birth here — there are no fields for
        them by design. If they appear on a form (an I-9, say), upload the document instead;
        files stay in private storage rather than becoming searchable data.
      </p>

      <div className="admin-form-actions">
        <Link href={staff ? `/admin/staff/${staff.id}` : '/admin/staff'} className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-warm" disabled={saving}>
          {saving ? 'Saving…' : staff ? 'Save Changes' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
