'use client';

import { useEffect } from 'react';
import {
  trackEvent,
  locationFromHref,
  orderProviderFromHref,
  isDirectionsHref,
  captureFirstTouchUtms,
} from '@/lib/analytics';

// One delegated listener for the whole document. Because it inspects the
// clicked anchor at event time, it covers every current AND future link
// without per-button wiring. Handles left-click plus auxclick/cmd-click, which
// is how users open external order/directions links in a new tab.
function handleLinkClick(e: MouseEvent) {
  // auxclick also fires for right-clicks. Only a middle-click opens the link.
  if (e.type === 'auxclick' && e.button !== 1) return;
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

// No manual page_view here. GA4 Enhanced measurement ("page changes based on
// browser history events", on for G-RQE3YPW3DM) already sends a page_view for
// every client-side <Link> navigation. A manual one on top of it counted every
// in-site navigation twice (seen live on 2026-09-21). UTM attribution doesn't
// need it either: GA4 keeps the landing hit's campaign for the whole session.
export function AnalyticsProvider() {
  useEffect(() => {
    // Stash the landing UTMs once per session (before any internal navigation
    // can strip them from the URL) so catering leads can carry their source.
    captureFirstTouchUtms();
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('auxclick', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('auxclick', handleLinkClick);
    };
  }, []);

  return null;
}
