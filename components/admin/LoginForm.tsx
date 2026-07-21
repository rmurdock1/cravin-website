'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'google' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Primary path: one-click Google sign-in (staff already have Workspace/Gmail
  // accounts). Supabase links the Google identity to the invited account with the
  // same verified email, so the assigned role carries over.
  async function handleGoogle() {
    setStatus('google');
    setErrorMsg('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
    // On success the browser navigates to Google; nothing else to do here.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div className="admin-login-card">
        <h1>Check your email</h1>
        <p>
          We sent a secure sign-in link to <strong>{email}</strong>. Click it to
          access the admin — no password needed. The link expires shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-login-card">
      <h1>Cravin Admin</h1>
      <p>Sign in to manage job postings and staff.</p>

      {initialError && status === 'idle' && <p className="admin-error">{initialError}</p>}

      <button type="button" className="admin-google-btn" onClick={handleGoogle} disabled={status === 'google'}>
        <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
        {status === 'google' ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="admin-login-divider"><span>or use an email link</span></div>

      <form onSubmit={handleSubmit} className="admin-login-form">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@cravinjc.com"
          autoComplete="email"
        />
        <button type="submit" className="btn btn-warm" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
        </button>
        {status === 'error' && (
          <p className="admin-error">{errorMsg || 'Something went wrong — please try again.'}</p>
        )}
      </form>
    </div>
  );
}
