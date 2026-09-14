'use client';

import { useState, useTransition } from 'react';
import { setUserActive, setUserRole } from './actions';
import { WelcomeMessage } from './WelcomeMessage';

interface Person {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

export function UserRow({
  person,
  selfId,
  senderName,
}: {
  person: Person;
  selfId: string;
  senderName: string | null;
}) {
  const [pending, startTransition] = useTransition();
  // The welcome message stays reachable here, not just right after inviting.
  const [showWelcome, setShowWelcome] = useState(false);
  const isSelf = person.id === selfId;
  const roleLabel = person.role === 'owner' ? 'Admin' : 'HR Manager';

  return (
    <div className="admin-team-person">
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
              <button
                type="button"
                className="admin-mini"
                aria-expanded={showWelcome}
                onClick={() => setShowWelcome((s) => !s)}
              >
                {showWelcome ? 'Hide welcome' : 'Welcome message'}
              </button>
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
      {showWelcome && (
        <WelcomeMessage
          email={person.email}
          fullName={person.full_name}
          role={person.role}
          senderName={senderName}
        />
      )}
    </div>
  );
}
