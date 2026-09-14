'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatBytes } from '@/lib/staff-data';
import { MAX_RESUME_BYTES, RESUME_BUCKET, resumeMimeFor } from '@/lib/applicants-data';
import {
  createResumeUpload,
  deleteApplicant,
  getResumeUrl,
  hireApplicant,
  recordResume,
  saveApplicantNotes,
} from './actions';

export function HireButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-warm"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Hire ${name}? This creates a Staff profile from their application, and you'll fill in the rest next.`)) return;
        startTransition(async () => {
          const res = await hireApplicant(id);
          if (res && !res.ok) alert(res.message);
        });
      }}
    >
      {pending ? 'Creating profile…' : 'Hire → Staff'}
    </button>
  );
}

export function DeleteApplicantButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-outline admin-danger-btn"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete ${name}'s application and resume? This cannot be undone.`)) return;
        startTransition(() => deleteApplicant(id));
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}

export function ResumeButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await getResumeUrl(id);
      if (res.ok) window.open(res.url, '_blank', 'noopener,noreferrer');
      else setError(res.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="admin-mini" disabled={busy} onClick={open}>
        {busy ? 'Opening…' : 'View'}
      </button>
      {error && <p className="admin-error">{error}</p>}
    </>
  );
}

/** Attach a resume the applicant sent later, or replace the current one. The
 *  file goes straight to private storage through a one-time signed upload URL
 *  that the server only issues to active staff. */
export function ResumeUpload({ id, replacing = false }: { id: string; replacing?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    if (!resumeMimeFor(file.name)) {
      setMsg({ ok: false, text: 'Resume must be a PDF, DOC, or DOCX file.' });
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setMsg({ ok: false, text: `That file is ${formatBytes(file.size)}. Maximum is 5 MB.` });
      return;
    }
    if (replacing && !confirm(`Replace the current resume with "${file.name}"? The old file will be deleted.`)) return;

    setBusy(true);
    setMsg(null);
    try {
      const start = await createResumeUpload(id, file.name, file.size);
      if (!start.ok) {
        setMsg({ ok: false, text: start.message });
        return;
      }
      const { error } = await createClient()
        .storage.from(RESUME_BUCKET)
        .uploadToSignedUrl(start.path, start.token, file, { contentType: start.mime });
      if (error) {
        setMsg({ ok: false, text: error.message });
        return;
      }
      const res = await recordResume(id, { path: start.path, fileName: file.name, size: file.size });
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        className={replacing ? 'admin-mini' : 'btn btn-outline'}
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? 'Uploading…' : replacing ? 'Replace' : 'Upload resume'}
      </button>
      {msg && <p className={msg.ok ? 'admin-template-msg' : 'admin-error'}>{msg.text}</p>}
    </>
  );
}

export function NotesForm({ id, notes }: { id: string; notes: string | null }) {
  const [state, action, pending] = useActionState(saveApplicantNotes, null);
  // Controlled: React resets uncontrolled fields after a form action completes.
  const [value, setValue] = useState(notes ?? '');

  return (
    <form action={action} className="admin-form admin-notes-form">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="notes"
        rows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Interview notes, follow-ups, references…"
        aria-label="HR notes"
      />
      <div className="admin-form-actions">
        {state && !pending && (
          <span className={state.ok ? 'admin-template-msg' : 'admin-error'}>{state.message}</span>
        )}
        <button type="submit" className="btn btn-warm" disabled={pending}>
          {pending ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </form>
  );
}
