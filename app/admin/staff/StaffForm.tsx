'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { saveStaff } from './actions';
import {
  LOCATIONS,
  EMPLOYMENT_TYPES,
  STAFF_STATUSES,
  type StaffRow,
} from '@/lib/staff-data';

export function StaffForm({
  staff,
  titleOptions,
}: {
  staff?: StaffRow;
  titleOptions: string[];
}) {
  const [saving, setSaving] = useState(false);
  const assigned = new Set(staff?.locations ?? []);

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
          <input
            id="job_title"
            name="job_title"
            list="job-title-options"
            defaultValue={staff?.job_title ?? ''}
            placeholder="Type or pick — e.g. Chef"
            autoComplete="off"
          />
          <datalist id="job-title-options">
            {titleOptions.map((t) => <option key={t} value={t} />)}
          </datalist>
          <span className="admin-field-hint">New titles are saved to the list automatically.</span>
        </div>

        <div className="admin-field full">
          <label>Locations</label>
          <div className="admin-checkbox-row">
            {LOCATIONS.map((l) => (
              <label key={l.value} className="admin-checkbox">
                <input type="checkbox" name="locations" value={l.value} defaultChecked={assigned.has(l.value)} />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
          <span className="admin-field-hint">Check every store this person works at. Two or more marks them a floater.</span>
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
          <PhoneInput id="phone" name="phone" defaultValue={staff?.phone ?? ''} />
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
          <PhoneInput id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={staff?.emergency_contact_phone ?? ''} />
        </div>
        <div className="admin-field full">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={staff?.notes ?? ''} />
        </div>
      </div>

      <div className="admin-form-actions">
        <Link href={staff ? `/admin/staff/${staff.id}` : '/admin/staff'} className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-warm" disabled={saving}>
          {saving ? 'Saving…' : staff ? 'Save Changes' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
