'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { announcement, ANNOUNCEMENT_DISMISS_KEY } from '@/lib/site-data';
import { trackEvent } from '@/lib/analytics';

const DISMISSED_ATTR = 'data-announcement-dismissed';

/** Slim bar pinned above the navbar. Closing it is remembered per device.
 *  Visibility is driven by a data-announcement-dismissed attribute on <html>,
 *  which the root layout's inline script sets before paint for returning
 *  visitors, so a closed bar never flashes and there's no hydration mismatch. */
export function AnnouncementBar() {
  const current = announcement;

  // Self-heal: if React ever client-renders the root (e.g. after a hydration
  // error) it drops attributes the head script put on <html>, which would
  // bring a closed bar back.
  useEffect(() => {
    if (!current) return;
    try {
      if (localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === current.id) {
        document.documentElement.setAttribute(DISMISSED_ATTR, '');
      }
    } catch {
      // Storage blocked: nothing to restore.
    }
  }, [current]);

  if (!current) return null;

  function dismiss() {
    try {
      localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, current!.id);
    } catch {
      // Storage blocked (private mode): still hide it for this page view.
    }
    // The focused close button is about to disappear; move focus to the start
    // of the navigation so keyboard and screen-reader users don't land on <body>.
    document.querySelector<HTMLElement>('nav[aria-label="Main navigation"] a')?.focus();
    document.documentElement.setAttribute(DISMISSED_ATTR, '');
  }

  return (
    // data-nosnippet keeps this site-wide text out of Google's result snippets.
    <div className="announcement-bar" role="region" aria-label="Announcement" data-nosnippet="">
      <div className="announcement-inner">
        <Link
          href={current.href}
          className="announcement-link"
          onClick={() => trackEvent('announcement_click', { announcement_id: current.id })}
        >
          {current.badge && (
            <>
              <span className="announcement-badge">{current.badge}</span>{' '}
            </>
          )}
          <span className="announcement-text announcement-text-full">{current.message}</span>{' '}
          <span className="announcement-text announcement-text-short">{current.shortMessage}</span>{' '}
          <span className="announcement-cta">
            <span className="announcement-cta-label">Learn more </span>
            <span aria-hidden="true">&rarr;</span>
          </span>
        </Link>
        <button type="button" className="announcement-dismiss" aria-label="Close announcement" onClick={dismiss}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
}
