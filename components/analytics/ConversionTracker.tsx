'use client';

import { useEffect } from 'react';
import { flushStashedConversions } from '@/lib/analytics';

// Mounted on /success. Fires any conversion event stashed by a form submit on a
// stable, already-loaded page, avoiding the page-unload race that dropped the
// gtag beacon when the event was fired during the submit navigation.
export function ConversionTracker() {
  useEffect(() => {
    flushStashedConversions();
  }, []);
  return null;
}
