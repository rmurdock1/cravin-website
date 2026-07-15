'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
      <p>Enter your email and we&apos;ll send you a secure sign-in link.</p>
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
