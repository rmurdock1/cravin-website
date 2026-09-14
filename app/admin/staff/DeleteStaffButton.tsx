'use client';

import { useTransition } from 'react';
import { deleteStaff } from './actions';

export function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn btn-outline admin-danger-btn"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Delete ${name}'s profile and all of their uploaded documents? This cannot be undone.`
          )
        )
          return;
        startTransition(async () => {
          const res = await deleteStaff(id);
          if (res && !res.ok) alert(res.message);
        });
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
