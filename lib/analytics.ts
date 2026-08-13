// Lightweight GA4 event layer.
//
// Reuses the existing gtag tag already loaded site-wide in
// components/analytics/GoogleAnalytics.tsx (keyed off NEXT_PUBLIC_GA_ID). This
// file adds NO second analytics install — it only emits events onto the tag
// that is already there.
//
// Every function is client-safe: it no-ops during SSR, and when gtag has not
// loaded (e.g. a deploy preview or local dev without NEXT_PUBLIC_GA_ID) it
// falls back to a dataLayer push so events stay observable for verification.

import { locations } from './site-data';

// ---------------------------------------------------------------------------
// Catering lead-value constants — REVIEW BEFORE GO-LIVE (see ANALYTICS-CHANGES.md)
// ---------------------------------------------------------------------------

/**
 * Per-guest dollar estimate used to derive a catering lead `value` when the
 * visitor did NOT build a priced cart (Quick Inquiry) but DID give a guest
 * count. PLACEHOLDER — the catering hero advertises $15–25 per person; RPM
 * should set the real blended figure here before relying on GA4 revenue.
 */
export const PER_GUEST_ESTIMATE_USD = 20;

/**
 * Fallback dollar value for a catering lead when there is neither a priced
 * cart nor a guest count. PLACEHOLDER — RPM to confirm a sensible average
 * lead value. Leads using this fall back carry value_basis: 'placeholder'.
 */
export const FALLBACK_CATERING_LEAD_VALUE_USD = 500;

// ---------------------------------------------------------------------------
// Core emit
// ---------------------------------------------------------------------------

type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Strip undefined values so GA4 event params stay clean. */
function clean(params: GtagParams): GtagParams {
  const out: GtagParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

export function trackEvent(name: string, params: GtagParams = {}): void {
  if (typeof window === 'undefined') return;
  const payload = clean(params);
  const w = window;
  w.dataLayer = w.dataLayer || [];
  // If the GA library hasn't defined gtag yet (can happen on /success, where we
  // fire in useEffect before the afterInteractive GA script runs), install the
  // standard gtag shim. It queues the hit in the correct arguments format so
  // GA4 sends it once the library loads — NOT a GTM-style object push, which a
  // real gtag tag would ignore.
  if (typeof w.gtag !== 'function') {
    w.gtag = function gtag() {
      w.dataLayer!.push(arguments);
    };
  }
  w.gtag('event', name, payload);
}

// ---------------------------------------------------------------------------
// Link classification helpers (data-driven off site-data)
// ---------------------------------------------------------------------------

const ORDER_PROVIDERS: { match: RegExp; provider: string }[] = [
  { match: /ubereats\.com/i, provider: 'ubereats' },
  { match: /ezcater\.com/i, provider: 'ezcater' },
  { match: /doordash\.com/i, provider: 'doordash' },
  { match: /toasttab\.com/i, provider: 'toast' },
  { match: /chownow\.com/i, provider: 'chownow' },
  { match: /grubhub\.com/i, provider: 'grubhub' },
  { match: /seamless\.com/i, provider: 'seamless' },
  { match: /slicelife\.com/i, provider: 'slice' },
];

/** Returns the ordering provider for an outbound href, or null. */
export function orderProviderFromHref(href: string): string | null {
  for (const p of ORDER_PROVIDERS) if (p.match.test(href)) return p.provider;
  return null;
}

/** True for a Google Maps "Get Directions" link (not an embed iframe). */
export function isDirectionsHref(href: string): boolean {
  return /google\.[^/]+\/maps\/dir/i.test(href) || /google\.[^/]+\/maps.*[?&]destination=/i.test(href);
}

/**
 * Best-effort resolve which restaurant a link belongs to, by matching the href
 * against known per-location phone numbers, directions URLs, and provider URLs.
 */
export function locationFromHref(href: string): string | undefined {
  const telDigits = href.startsWith('tel:') ? href.replace(/\D/g, '') : null;
  for (const loc of locations) {
    if (telDigits && loc.phone.replace(/\D/g, '') === telDigits) return loc.shortName;
    if (href.includes(loc.googleMapsUrl)) return loc.shortName;
    if (loc.ordering.ubereats && href.startsWith(loc.ordering.ubereats)) return loc.shortName;
    if (loc.ordering.ezcater && href.startsWith(loc.ordering.ezcater)) return loc.shortName;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Catering lead value + form-submit dispatch
// ---------------------------------------------------------------------------

/**
 * Derive the estimated dollar value of a catering lead.
 * Priority: real cart total (Build Your Order) → guest_count × per-head
 * estimate → fixed placeholder. `basis` records which rule fired.
 */
export function computeCateringLeadValue(
  get: (key: string) => string | null
): { value: number; basis: 'cart_total' | 'guest_estimate' | 'placeholder' } {
  const cart = parseFloat((get('lead_value') || '').replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(cart) && cart > 0) {
    return { value: Math.round(cart * 100) / 100, basis: 'cart_total' };
  }
  const guests = parseInt((get('guest_count') || '').replace(/[^0-9]/g, ''), 10);
  if (!Number.isNaN(guests) && guests > 0) {
    return { value: guests * PER_GUEST_ESTIMATE_USD, basis: 'guest_estimate' };
  }
  return { value: FALLBACK_CATERING_LEAD_VALUE_USD, basis: 'placeholder' };
}

// sessionStorage key for the submit -> /success conversion relay.
const CONVERSION_KEY = 'cateringConversion';

interface PendingEvent {
  name: string;
  params: GtagParams;
}

/**
 * Build (but do not fire) the GA4 events for a submitted form. Catering forms
 * produce GA4's recommended `generate_lead` (with value/currency) plus a
 * `catering_request` alias for report clarity; other forms produce a generic
 * `form_submit`.
 */
function buildFormEvents(get: (key: string) => string | null): PendingEvent[] {
  const formName = get('form-name') || 'unknown';
  const pagePath = typeof window !== 'undefined' ? window.location.pathname : undefined;

  if (formName === 'catering-order' || formName === 'catering-inquiry') {
    const { value, basis } = computeCateringLeadValue(get);
    const guestsRaw = get('guest_count');
    const guests = guestsRaw ? parseInt(guestsRaw.replace(/[^0-9]/g, ''), 10) : undefined;
    const params: GtagParams = {
      currency: 'USD',
      value,
      value_basis: basis,
      form_name: formName,
      form_type: get('form_type') || formName,
      location: get('location') || undefined,
      event_type: get('event_type') || undefined,
      guest_count: Number.isFinite(guests) ? guests : undefined,
      event_date: get('event_date') || undefined,
      page_path: pagePath,
    };
    return [
      { name: 'generate_lead', params },
      { name: 'catering_request', params },
    ];
  }
  return [{ name: 'form_submit', params: { form_name: formName, page_path: pagePath } }];
}

/**
 * Stash the conversion events for a successful form submit into sessionStorage,
 * to be fired on the /success page. Firing here (right before the navigation to
 * /success) would race the page unload and lose the gtag beacon — the whole
 * reason conversions weren't reaching GA4. Called from lib/netlify-forms.ts.
 */
export function stashFormConversion(formData: FormData): void {
  if (typeof window === 'undefined') return;
  const get = (key: string): string | null => {
    const v = formData.get(key);
    return typeof v === 'string' ? v : null;
  };
  const events = buildFormEvents(get);
  if (!events.length) return;
  try {
    sessionStorage.setItem(CONVERSION_KEY, JSON.stringify({ events }));
  } catch {
    // sessionStorage unavailable (private mode quota etc.) — skip silently.
  }
}

// Wait until gtag is defined by the GA library (which also queues config just
// before), then run cb so the event is sent AFTER config. Falls back to firing
// anyway after ~4s so a blocked/slow GA still queues the hit via the shim.
function whenGtagReady(cb: () => void, tries = 40): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    cb();
    return;
  }
  if (tries <= 0) {
    cb();
    return;
  }
  setTimeout(() => whenGtagReady(cb, tries - 1), 100);
}

/**
 * Read any stashed conversion from sessionStorage and fire it on the current
 * (already-loaded, stable) page. Called on /success mount. Clears the stash
 * first so a remount can't double-fire.
 */
export function flushStashedConversions(): void {
  if (typeof window === 'undefined') return;
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(CONVERSION_KEY);
  } catch {
    return;
  }
  if (!raw) return;
  try {
    sessionStorage.removeItem(CONVERSION_KEY);
  } catch {
    /* ignore */
  }
  let events: PendingEvent[] | undefined;
  try {
    events = JSON.parse(raw).events;
  } catch {
    return;
  }
  if (!events || !events.length) return;
  whenGtagReady(() => {
    for (const e of events) trackEvent(e.name, e.params);
  });
}
