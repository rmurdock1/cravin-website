'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Keeps /admin out of GA4 collection with an explicit path check in site code.
 *
 * Primary mechanism is still HideOnAdmin (GoogleAnalytics isn't rendered on
 * /admin, so gtag never loads on a direct admin load). This is belt-and-braces:
 * if gtag is already loaded on a public page and the app ever navigates into
 * /admin client-side, GA4 Enhanced measurement ("page_view on browser-history
 * events") would otherwise auto-send a page_view for the admin path. Setting
 * gtag's standard opt-out flag `window['ga-disable-<ID>']` suppresses ALL hits
 * while on /admin — checked by gtag before every hit — and it re-evaluates on
 * each client-side navigation in and out of the admin subtree, covering
 * /admin/login and every /admin/staff/<uuid> route.
 *
 * Mounted OUTSIDE HideOnAdmin so it runs on every route.
 */
export function AdminAnalyticsGate() {
  const pathname = usePathname();
  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined') return;
    const w = window as unknown as Record<string, unknown>;
    w[`ga-disable-${GA_ID}`] = pathname?.startsWith('/admin') ?? false;
  }, [pathname]);
  return null;
}
