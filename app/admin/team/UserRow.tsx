'use client';

import { useTransition } from 'react';
import { setUserActive, setUserRole } from './actions';

interface Person {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

export function UserRow({ person, selfId }: { person: Person; selfId: string }) {
  const [pending, startTransition] = useTransition();
  const isSelf = person.id === selfId;
  const roleLabel = person.role === 'owner' ? 'Admin' : 'HR Manager';

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <div className="admin-list-title">
          {person.full_name || person.email}
          {isSelf && <span className="admin-self-tag">You</span>}
        </div>
        <div className="admin-list-meta">
          {person.email} ·{' '}
          <span className={`admin-badge ${person.is_active ? 'on' : 'off'}`}>
            {person.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="admin-list-actions">
        {isSelf ? (
          <span className="admin-role-static">{roleLabel}</span>
        ) : (
          <>
            <select
              className="admin-role-select"
              disabled={pending}
              defaultValue={person.role}
              onChange={(e) => startTransition(() => setUserRole(person.id, e.target.value))}
              aria-label="Role"
            >
              <option value="hr_manager">HR Manager</option>
              <option value="owner">Admin</option>
            </select>
            <button
              className={`admin-mini ${person.is_active ? 'danger' : ''}`}
              disabled={pending}
              onClick={() => startTransition(() => setUserActive(person.id, !person.is_active))}
            >
              {person.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
