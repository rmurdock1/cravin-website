'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { saveStaff } from './actions';
import { DocumentManager } from './DocumentManager';
import type { ParsedFields } from '@/lib/parse-document';
import {
  LOCATIONS,
  EMPLOYMENT_TYPES,
  STAFF_STATUSES,
  type StaffRow,
  type StaffDocumentRow,
} from '@/lib/staff-data';

export function StaffForm({
  staff,
  titleOptions,
  documents,
}: {
  staff: StaffRow;
  titleOptions: string[];
  documents: StaffDocumentRow[];
}) {
  const [saving, setSaving] = useState(false);
  // Controlled so a document scan can pre-fill fields without wiping manual edits.
  const [form, setForm] = useState({
    full_name: staff.full_name ?? '',
    job_title: staff.job_title ?? '',
    employment_type: staff.employment_type ?? '',
    status: staff.status ?? 'active',
    hired_on: staff.hired_on ?? '',
    email: staff.email ?? '',
    phone: staff.phone ?? '',
    address: staff.address ?? '',
    emergency_contact_name: staff.emergency_contact_name ?? '',
    emergency_contact_phone: staff.emergency_contact_phone ?? '',
    notes: staff.notes ?? '',
  });
  const [locs, setLocs] = useState<Set<string>>(new Set(staff.locations ?? []));
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function toggleLoc(v: string) {
    setLocs((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  }

  // A scan fills only the fields it found; existing values in other fields stay.
  function applyScan(fields: Partial<ParsedFields>) {
    setForm((p) => {
      const next = { ...p };
      for (const [k, val] of Object.entries(fields)) {
        if (typeof val === 'string' && val.trim()) next[k as keyof typeof form] = val.trim();
      }
      return next;
    });
  }

  return (
    <>
      <form action={saveStaff} onSubmit={() => setSaving(true)} className="admin-form">
        <input type="hidden" name="id" value={staff.id} />

        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="full_name">Full Name *</label>
            <input id="full_name" name="full_name" required value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="job_title">Job Title</label>
            <input
              id="job_title"
              name="job_title"
              list="job-title-options"
              value={form.job_title}
              onChange={(e) => set('job_title', e.target.value)}
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
                  <input type="checkbox" name="locations" value={l.value}
                    checked={locs.has(l.value)} onChange={() => toggleLoc(l.value)} />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>
            <span className="admin-field-hint">Check every store this person works at. Two or more marks them a floater.</span>
          </div>

          <div className="admin-field">
            <label htmlFor="employment_type">Employment Type</label>
            <select id="employment_type" name="employment_type" value={form.employment_type}
              onChange={(e) => set('employment_type', e.target.value)}>
              <option value="">Select…</option>
              {EMPLOYMENT_TYPES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status}
              onChange={(e) => set('status', e.target.value)}>
              {STAFF_STATUSES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="hired_on">Hire Date</label>
            <input type="date" id="hired_on" name="hired_on" value={form.hired_on}
              onChange={(e) => set('hired_on', e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={form.email}
              onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="phone">Phone</label>
            <PhoneInput id="phone" name="phone" value={form.phone} onChange={(v) => set('phone', v)} />
          </div>
          <div className="admin-field full">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={form.address}
              onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="emergency_contact_name">Emergency Contact</label>
            <input id="emergency_contact_name" name="emergency_contact_name"
              value={form.emergency_contact_name}
              onChange={(e) => set('emergency_contact_name', e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="emergency_contact_phone">Emergency Phone</label>
            <PhoneInput id="emergency_contact_phone" name="emergency_contact_phone"
              value={form.emergency_contact_phone} onChange={(v) => set('emergency_contact_phone', v)} />
          </div>
          <div className="admin-field full">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={3} value={form.notes}
              onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>

        {/* Documents live inside the editor: upload + scan-to-prefill happen here,
            so adding a new hire is a single page. DocumentManager renders no <form>
            of its own and uses type="button", so it's safe inside this form. */}
        <div className="admin-form-docs">
          <DocumentManager staffId={staff.id} documents={documents} onApply={applyScan} />
        </div>

        <div className="admin-form-actions">
          <Link href={staff.full_name ? `/admin/staff/${staff.id}` : '/admin/staff'} className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-warm" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </>
  );
}
