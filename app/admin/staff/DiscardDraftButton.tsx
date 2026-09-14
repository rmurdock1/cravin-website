'use client';

import { useTransition } from 'react';
import { discardDraft } from './actions';

/** Discard an unsaved Add Staff draft and its uploaded documents. Full size on
 *  the Add Staff form; `compact` for the Unsaved drafts list. */
export function DiscardDraftButton({
  id,
  documentCount,
  compact = false,
}: {
  id: string;
  documentCount: number;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function discard() {
    const docs = documentCount === 1 ? 'its uploaded document' : `its ${documentCount} uploaded documents`;
    const question =
      documentCount > 0
        ? `Discard this unsaved profile? ${docs[0].toUpperCase()}${docs.slice(1)} will be deleted for good.`
        : 'Discard this unsaved profile?';
    if (!confirm(question)) return;
    startTransition(async () => {
      const res = await discardDraft(id);
      if (res && !res.ok) alert(res.message);
    });
  }

  return (
    <button
      type="button"
      className={compact ? 'admin-mini danger' : 'btn btn-outline'}
      disabled={pending}
      onClick={discard}
    >
      {pending ? 'Discarding…' : compact ? 'Delete' : 'Discard'}
    </button>
  );
}
