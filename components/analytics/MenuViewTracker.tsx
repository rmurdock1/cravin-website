'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

// Fires the GA4 `menu_view` event once when the menu page mounts (initial load
// or client-side navigation to /menu).
export function MenuViewTracker() {
  useEffect(() => {
    trackEvent('menu_view', { page_path: '/menu' });
  }, []);
  return null;
}
