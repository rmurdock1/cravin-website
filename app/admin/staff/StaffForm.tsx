'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { saveStaff } from './actions';
import { DocumentManager } from './DocumentManager';
import {
  LOCATIONS,
  EMPLOYMENT_TYPES,
  STAFF_STATUSES,
  type ParsedFields,
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
  // An unsaved draft has no name yet: that's Add Staff, where scanning a
  // document comes first because it's the fastest way to fill the profile.
  const isNew = !staff.full_name;
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
    emergency_contact_relationship: staff.emergency_contact_relationship ?? '',
    notes: staff.notes ?? '',
  });
  const [locs, setLocs] = useState<Set<string>>(new Set(staff.locations ?? []));
  // Fields a scan filled in, marked until someone edits them.
  const [scanned, setScanned] = useState<Set<string>>(new Set());

  const unmark = (key: string) =>
    setScanned((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

  const set = (k: keyof typeof form, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    unmark(k);
  };

  function toggleLoc(v: string) {
    setLocs((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
    unmark('locations');
  }

  // A scan fills only the fields it found; existing values in other fields stay.
  // Scanned locations are added to any already ticked, never untick one.
  function applyScan(fields: Partial<ParsedFields>) {
    const { locations, ...rest } = fields;
    const filled = Object.entries(rest).filter(
      (entry): entry is [keyof typeof form, string] =>
        entry[0] in form && typeof entry[1] === 'string' && entry[1].trim() !== ''
    );
    setForm((p) => {
      const next = { ...p };
      for (const [k, val] of filled) next[k] = val.trim();
      return next;
    });
    if (locations?.length) setLocs((prev) => new Set([...prev, ...locations]));
    setScanned(
      (prev) =>
        new Set([...prev, ...filled.map(([k]) => k), ...(locations?.length ? ['locations'] : [])])
    );
    // Bring the filled-in details into view so they get checked before saving.
    requestAnimationFrame(() =>
      document.getElementById('staff-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  }

  const fieldClass = (key: string, extra = '') =>
    ['admin-field', extra, scanned.has(key) ? 'is-scanned' : ''].filter(Boolean).join(' ');
  const scanTag = (key: string) =>
    scanned.has(key) ? <span className="admin-scan-tag">✨ from scan</span> : null;

  const documentsSection = (
    <div className={isNew ? 'admin-form-docs is-first' : 'admin-form-docs'}>
      <DocumentManager
        staffId={staff.id}
        documents={documents}
        onApply={applyScan}
        autoScan={isNew}
        heading={
          isNew ? (
            <>
              <span className="admin-step-num">1</span> Start with a document
            </>
          ) : undefined
        }
        intro={
          isNew ? (
            <>
              The fastest way to fill in a profile. Upload an onboarding form, offer letter or I-9: PDFs
              and photos are scanned automatically. Check what it found and click <strong>Apply</strong> to
              fill in the details below. Files are stored privately and every view is logged.{' '}
              <a href="#staff-details">No document? Skip to the details.</a>
            </>
          ) : undefined
        }
      />
    </div>
  );

  const detailsSection = (
    <section id="staff-details" className="admin-form-section">
      {isNew && (
        <h2 className="admin-step-heading">
          <span className="admin-step-num">2</span> Review &amp; complete the details
        </h2>
      )}
      <div className="admin-form-grid">
        <div className={fieldClass('full_name')}>
          <label htmlFor="full_name">Full Name * {scanTag('full_name')}</label>
          <input id="full_name" name="full_name" required value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)} />
        </div>
        <div className={fieldClass('job_title')}>
          <label htmlFor="job_title">Job Title {scanTag('job_title')}</label>
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

        <div className={fieldClass('locations', 'full')}>
          <label>Locations {scanTag('locations')}</label>
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

        <div className={fieldClass('employment_type')}>
          <label htmlFor="employment_type">Employment Type {scanTag('employment_type')}</label>
          <select id="employment_type" name="employment_type" value={form.employment_type}
            onChange={(e) => set('employment_type', e.target.value)}>
            <option value="">Select…</option>
            {EMPLOYMENT_TYPES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className={fieldClass('status')}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status}
            onChange={(e) => set('status', e.target.value)}>
            {STAFF_STATUSES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className={fieldClass('hired_on')}>
          <label htmlFor="hired_on">Hire Date {scanTag('hired_on')}</label>
          <input type="date" id="hired_on" name="hired_on" value={form.hired_on}
            onChange={(e) => set('hired_on', e.target.value)} />
        </div>
        <div className={fieldClass('email')}>
          <label htmlFor="email">Email {scanTag('email')}</label>
          <input type="email" id="email" name="email" value={form.email}
            onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className={fieldClass('phone')}>
          <label htmlFor="phone">Phone {scanTag('phone')}</label>
          <PhoneInput id="phone" name="phone" value={form.phone} onChange={(v) => set('phone', v)} />
        </div>
        <div className={fieldClass('address', 'full')}>
          <label htmlFor="address">Address {scanTag('address')}</label>
          <input id="address" name="address" value={form.address}
            onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className={fieldClass('emergency_contact_name')}>
          <label htmlFor="emergency_contact_name">Emergency Contact {scanTag('emergency_contact_name')}</label>
          <input id="emergency_contact_name" name="emergency_contact_name"
            value={form.emergency_contact_name}
            onChange={(e) => set('emergency_contact_name', e.target.value)} />
        </div>
        <div className={fieldClass('emergency_contact_phone')}>
          <label htmlFor="emergency_contact_phone">Emergency Phone {scanTag('emergency_contact_phone')}</label>
          <PhoneInput id="emergency_contact_phone" name="emergency_contact_phone"
            value={form.emergency_contact_phone} onChange={(v) => set('emergency_contact_phone', v)} />
        </div>
        <div className={fieldClass('emergency_contact_relationship')}>
          <label htmlFor="emergency_contact_relationship">
            Emergency Contact Relationship {scanTag('emergency_contact_relationship')}
          </label>
          <input id="emergency_contact_relationship" name="emergency_contact_relationship"
            value={form.emergency_contact_relationship} placeholder="e.g. Spouse, Parent"
            onChange={(e) => set('emergency_contact_relationship', e.target.value)} />
        </div>
        <div className={fieldClass('notes', 'full')}>
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} value={form.notes}
            onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>
    </section>
  );

  return (
    <>
      <form action={saveStaff} onSubmit={() => setSaving(true)} className="admin-form">
        <input type="hidden" name="id" value={staff.id} />

        {/* Documents live inside the editor so adding someone is a single page.
            DocumentManager renders no <form> of its own and uses type="button",
            so it's safe inside this form. Add Staff leads with the document;
            editing an existing profile leads with the details. */}
        {isNew ? (
          <>
            {documentsSection}
            {detailsSection}
          </>
        ) : (
          <>
            {detailsSection}
            {documentsSection}
          </>
        )}

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
