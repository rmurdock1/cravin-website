'use client';

import { useActionState, useState, useTransition } from 'react';
import { deleteApplicant, getResumeUrl, hireApplicant, saveApplicantNotes } from './actions';

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
