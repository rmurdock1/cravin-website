'use client';

import { useState } from 'react';
import { gmailComposeUrl, welcomeMessage, type WelcomeInput } from '@/lib/welcome-message';

export function WelcomeMessage(props: WelcomeInput) {
  const { subject, body } = welcomeMessage(props);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <div className="admin-welcome">
      <div className="admin-welcome-head">
        <div>
          <h3>Welcome message for {props.email}</h3>
          <p className="admin-hint">
            Send this from your own email so it arrives from someone they know.
          </p>
        </div>
        <div className="admin-list-actions">
          <button type="button" className="admin-mini" onClick={copy}>
            {copyState === 'copied' ? 'Copied ✓' : 'Copy message'}
          </button>
          <a
            className="admin-mini"
            href={gmailComposeUrl(props.email, subject, body)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Gmail
          </a>
        </div>
      </div>
      {copyState === 'failed' && (
        <p className="admin-error">Couldn&apos;t copy automatically. Select the text below and copy it.</p>
      )}
      <p className="admin-welcome-subject">
        <strong>Subject:</strong> {subject}
      </p>
      <pre className="admin-welcome-body">{body}</pre>
    </div>
  );
}
