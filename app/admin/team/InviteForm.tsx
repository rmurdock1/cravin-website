'use client';

import { useActionState } from 'react';
import { inviteUser, type InviteState } from './actions';

export function InviteForm() {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteUser, null);

  return (
    <form action={formAction} className="admin-invite">
      <div className="admin-invite-fields">
        <label>
          Email *
          <input type="email" name="email" required placeholder="person@email.com" />
        </label>
        <label>
          Full name
          <input type="text" name="full_name" placeholder="Optional" />
        </label>
        <label>
          Role
          <select name="role" defaultValue="hr_manager">
            <option value="hr_manager">HR Manager</option>
            <option value="owner">Admin (full access)</option>
          </select>
        </label>
        <button type="submit" className="btn btn-warm" disabled={pending}>
          {pending ? 'Inviting…' : 'Invite'}
        </button>
      </div>
      {state && (
        <p className={state.ok ? 'admin-template-msg' : 'admin-error'}>{state.message}</p>
      )}
    </form>
  );
}
