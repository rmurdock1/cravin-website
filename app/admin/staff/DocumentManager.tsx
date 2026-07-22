'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  recordDocument,
  getDocumentUrl,
  deleteDocument,
  parseStaffDocument,
  applyParsedFields,
} from './actions';
import type { ParsedFields } from '@/lib/parse-document';
import {
  BUCKET,
  DOC_TYPES,
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  formatBytes,
  labelFor,
  type StaffDocumentRow,
} from '@/lib/staff-data';

export function DocumentManager({
  staffId,
  documents,
}: {
  staffId: string;
  documents: StaffDocumentRow[];
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [review, setReview] = useState<{ fields: ParsedFields; include: Set<string> } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  const FIELD_LABELS: Record<keyof ParsedFields, string> = {
    full_name: 'Full Name',
    job_title: 'Job Title',
    phone: 'Phone',
    address: 'Address',
    emergency_contact_name: 'Emergency Contact',
    emergency_contact_phone: 'Emergency Phone',
  };

  async function handleScan(id: string) {
    setScanningId(id);
    setMsg(null);
    setReview(null);
    try {
      const res = await parseStaffDocument(id);
      if (!res.ok) {
        setMsg({ ok: false, text: res.message });
        return;
      }
      const present = Object.entries(res.fields).filter(([, v]) => v).map(([k]) => k);
      if (present.length === 0) {
        setMsg({ ok: false, text: 'No contact basics were found in that document.' });
        return;
      }
      setReview({ fields: res.fields, include: new Set(present) });
    } finally {
      setScanningId(null);
    }
  }

  function toggleField(key: string) {
    setReview((r) => {
      if (!r) return r;
      const include = new Set(r.include);
      include.has(key) ? include.delete(key) : include.add(key);
      return { ...r, include };
    });
  }

  function applyReview() {
    if (!review) return;
    const selected: Partial<ParsedFields> = {};
    for (const key of review.include) {
      selected[key as keyof ParsedFields] = review.fields[key as keyof ParsedFields];
    }
    startTransition(async () => {
      await applyParsedFields(staffId, selected);
      setReview(null);
      setMsg({ ok: true, text: 'Profile updated from the document.' });
      router.refresh();
    });
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    if (!ACCEPTED_MIME.includes(file.type)) {
      setMsg({ ok: false, text: 'Unsupported file type. Use PDF, JPG, PNG, HEIC or Word.' });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setMsg({ ok: false, text: `That file is ${formatBytes(file.size)}. Maximum is 10 MB.` });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      // Upload straight to private storage with the user's own session, so
      // storage RLS applies and big PDFs skip the serverless request body.
      const supabase = createClient();
      const safe = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${staffId}/${crypto.randomUUID()}-${safe}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) {
        setMsg({ ok: false, text: error.message });
        return;
      }

      const res = await recordDocument({
        staff_id: staffId,
        storage_path: path,
        file_name: file.name,
        doc_type: typeRef.current?.value ?? 'other',
        mime_type: file.type || null,
        size_bytes: file.size,
      });
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok && fileRef.current) fileRef.current.value = '';
    } finally {
      setBusy(false);
    }
  }

  async function openDoc(id: string) {
    const res = await getDocumentUrl(id);
    if (res.ok) window.open(res.url, '_blank', 'noopener,noreferrer');
    else setMsg({ ok: false, text: res.message });
  }

  return (
    <section className="admin-docs">
      <h2>Documents</h2>
      <p className="admin-hint">
        I-9s, W-4s, offer letters, certifications. Stored privately — links expire after
        60 seconds and every view is logged.
      </p>

      <form onSubmit={handleUpload} className="admin-upload">
        <select ref={typeRef} defaultValue="other" className="admin-role-select" aria-label="Document type">
          {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_MIME.join(',')}
          className="admin-file-input"
          aria-label="Choose file"
        />
        <button type="submit" className="btn btn-warm" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {msg && <p className={msg.ok ? 'admin-template-msg' : 'admin-error'}>{msg.text}</p>}

      {review && (
        <div className="admin-scan-review">
          <h3>Review extracted details</h3>
          <p className="admin-hint">
            Claude read this document. Check what you want to apply — it overwrites the matching
            profile fields. Nothing is saved until you click Apply. (SSNs and dates of birth are
            never extracted.)
          </p>
          {(Object.keys(FIELD_LABELS) as (keyof ParsedFields)[])
            .filter((k) => review.fields[k])
            .map((k) => (
              <label key={k} className="admin-scan-field">
                <input
                  type="checkbox"
                  checked={review.include.has(k)}
                  onChange={() => toggleField(k)}
                />
                <span className="admin-scan-label">{FIELD_LABELS[k]}</span>
                <span className="admin-scan-value">{review.fields[k]}</span>
              </label>
            ))}
          <div className="admin-form-actions">
            <button className="btn btn-outline" onClick={() => setReview(null)} disabled={pending}>
              Discard
            </button>
            <button className="btn btn-warm" onClick={applyReview} disabled={pending || review.include.size === 0}>
              {pending ? 'Applying…' : `Apply ${review.include.size} field${review.include.size === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <p className="admin-hint">No documents uploaded yet.</p>
      ) : (
        <div className="admin-list">
          {documents.map((d) => (
            <div key={d.id} className="admin-list-row">
              <div className="admin-list-main">
                <div className="admin-list-title">{d.file_name}</div>
                <div className="admin-list-meta">
                  {labelFor(DOC_TYPES, d.doc_type)}
                  {d.size_bytes ? ` · ${formatBytes(d.size_bytes)}` : ''} ·{' '}
                  {new Date(d.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="admin-list-actions">
                <button className="admin-mini" onClick={() => openDoc(d.id)}>View</button>
                {['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
                  d.mime_type ?? ''
                ) && (
                  <button
                    className="admin-mini"
                    disabled={scanningId === d.id}
                    onClick={() => handleScan(d.id)}
                    title="Extract name, title, phone, address and emergency contact"
                  >
                    {scanningId === d.id ? 'Scanning…' : 'Scan ✨'}
                  </button>
                )}
                <button
                  className="admin-mini danger"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`Delete "${d.file_name}"? This cannot be undone.`)) return;
                    startTransition(() => deleteDocument(d.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
