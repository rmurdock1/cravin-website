'use client';

import { useActionState } from 'react';
import { inviteUser, type InviteState } from './actions';
import { WelcomeMessage } from './WelcomeMessage';

export function InviteForm() {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteUser, null);

  return (
    <form action={formAction} className="admin-invite">
      <div className="admin-invite-fields">
        <label>
          Google account email *
          <input type="email" name="email" required placeholder="person@gmail.com" />
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
      {state?.invited && <WelcomeMessage {...state.invited} />}
    </form>
  );
}
