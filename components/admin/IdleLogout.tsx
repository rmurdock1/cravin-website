'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Sign an admin out after this much inactivity. Covers the common case of a tab
// left open/backgrounded — the reported "still logged in a week later". A hard
// server-side cap (for tabs fully closed then reopened) is set separately in
// Supabase Auth → Sessions (inactivity timeout + time-box).
const IDLE_MS = 30 * 60 * 1000; // 30 minutes
const KEY = 'cravin_admin_last_active';

export function IdleLogout() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin/login')) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastWrite = 0;

    const readLast = () => {
      try {
        return Number(localStorage.getItem(KEY) || 0);
      } catch {
        return 0;
      }
    };
    const touch = () => {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {}
    };

    const signOut = async () => {
      if (timer) clearTimeout(timer);
      try {
        await createClient().auth.signOut();
      } catch {}
      try {
        localStorage.removeItem(KEY);
      } catch {}
      window.location.href =
        '/admin/login?error=' +
        encodeURIComponent('You were signed out after 30 minutes of inactivity.');
    };

    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(signOut, IDLE_MS);
    };

    // On activity: re-arm the timer and (throttled) record the timestamp.
    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite > 5000) {
        lastWrite = now;
        touch();
      }
      arm();
    };

    // Returning to a backgrounded tab: if the last real activity was long ago,
    // sign out immediately instead of waiting out another idle window.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const last = readLast();
      if (last && Date.now() - last > IDLE_MS) void signOut();
      else arm();
    };

    touch();
    arm();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pathname]);

  return null;
}
