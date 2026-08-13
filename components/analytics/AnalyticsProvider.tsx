'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  trackEvent,
  locationFromHref,
  orderProviderFromHref,
  isDirectionsHref,
} from '@/lib/analytics';

// One delegated listener for the whole document. Because it inspects the
// clicked anchor at event time, it covers every current AND future link
// without per-button wiring. Handles left-click plus auxclick/cmd-click, which
// is how users open external order/directions links in a new tab.
function handleLinkClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  const anchor = target?.closest?.('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href') || '';
  if (!href) return;

  const page_path = window.location.pathname;
  const location = locationFromHref(href);

  if (href.startsWith('tel:')) {
    trackEvent('call_click', { page_path, location, phone: href.replace('tel:', '') });
    return;
  }
  if (href.startsWith('mailto:')) {
    trackEvent('email_click', { page_path, email: href.replace('mailto:', '') });
    return;
  }
  if (isDirectionsHref(href)) {
    trackEvent('directions_click', { page_path, location });
    return;
  }
  const provider = orderProviderFromHref(href);
  if (provider) {
    trackEvent('order_click', { page_path, provider, location, link_url: href });
  }
}

// Sends a GA4 page_view on client-side (SPA) route changes. The initial page
// view is already sent by gtag('config') on load, so we skip the first render
// to avoid double-counting. Keeps every internal page measurable and preserves
// session/UTM attribution across <Link> navigation.
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    trackEvent('page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  useEffect(() => {
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('auxclick', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('auxclick', handleLinkClick);
    };
  }, []);

  // useSearchParams requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
