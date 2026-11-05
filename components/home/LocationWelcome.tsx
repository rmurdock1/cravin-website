'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { locations } from '@/lib/site-data';

/**
 * Progressive enhancement for Google Business Profile arrivals.
 *
 * All three GBP links point at the homepage with ?utm_content=<id>
 * (mount-vernon | white-plains | ossining). When present, we surface that
 * restaurant's details near the top of the homepage so a visitor who came for
 * one location doesn't land on generic content and have to hunt.
 *
 * Renders NOTHING without a matching utm_content — the homepage is byte-identical
 * to today for everyone else. The block is injected client-side after mount
 * (useEffect -> setState), so SSR output is unchanged and there is no hydration
 * mismatch. The tel: and directions links are picked up by the global
 * AnalyticsProvider click listener (call_click / directions_click with location).
 */
function todaysHours(loc: (typeof locations)[number]): string | null {
  try {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return loc.hours.find((h) => h.day === day)?.hours ?? null;
  } catch {
    return null;
  }
}

export function LocationWelcome() {
  const [locId, setLocId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let slug = params.get('utm_content');
      // Fall back to the stashed first-touch UTM if the visitor already clicked
      // deeper into the site before reaching the homepage this session.
      if (!slug) {
        slug = JSON.parse(sessionStorage.getItem('firstTouchUtms') || '{}').utm_content || null;
      }
      if (slug && locations.some((l) => l.id === slug)) setLocId(slug);
    } catch {
      /* no query / no sessionStorage — stay hidden */
    }
  }, []);

  if (!locId) return null;
  const loc = locations.find((l) => l.id === locId)!;
  const hrs = todaysHours(loc);

  return (
    <section className="location-welcome" aria-label={`Your nearest Cravin: ${loc.shortName}`}>
      <div className="container location-welcome-inner">
        <div className="location-welcome-text">
          <span className="location-welcome-eyebrow">Your Cravin location</span>
          <h2 className="location-welcome-title">{loc.shortName}</h2>
          <p className="location-welcome-meta">
            {loc.fullAddress}
            {hrs ? (
              <>
                {' · '}
                <strong>Today:</strong> {hrs}
              </>
            ) : null}
          </p>
        </div>
        <div className="location-welcome-actions">
          <a href={`tel:${loc.phone}`} className="btn btn-warm">
            Call {loc.phoneFormatted}
          </a>
          <a
            href={loc.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-warm"
          >
            Get Directions
          </a>
          <Link href={`/${loc.id}`} className="btn btn-outline-green">
            Visit {loc.shortName} page
          </Link>
        </div>
      </div>
    </section>
  );
}
