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
        startTransition(() => deleteStaff(id));
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
