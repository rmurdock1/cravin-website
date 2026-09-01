# Analytics & SEO changes — Cravin Jamaican Cuisine

Branch: `analytics-seo-improvements`. No production deploy — review on the
Netlify deploy preview, then RPM approves go-live.

These changes wire GA4 conversion tracking onto the site's existing gtag tag
(loaded in `components/analytics/GoogleAnalytics.tsx` from the
`NEXT_PUBLIC_GA_ID` Netlify env var). **No second analytics install was added.**

---

## 1. Events now firing

All events are emitted through `trackEvent()` in `lib/analytics.ts`, which calls
`window.gtag('event', …)`. A single delegated click listener in
`components/analytics/AnalyticsProvider.tsx` inspects the clicked `<a>` at click
time, so **every current and future link is covered** with no per-button wiring.

| Event | Fires on | Key params |
|---|---|---|
| `order_click` | Click of any outbound ordering link (Uber Eats, EZCater; DoorDash/Toast/ChowNow/Grubhub/Seamless/Slice also recognized) | `provider`, `location`, `link_url`, `page_path` |
| `call_click` | Any `tel:` link tap | `location`, `phone`, `page_path` |
| `directions_click` | Any "Get Directions" Google Maps link | `location`, `page_path` |
| `menu_view` | `/menu` page load (initial or client nav) — `components/analytics/MenuViewTracker.tsx` | `page_path` |
| `catering_request` + `generate_lead` | Successful catering form submit (see §2) | `value`, `currency`, `location`… |
| `email_click` | Any `mailto:` tap (e.g. catering@) — bonus, not required | `email`, `page_path` |
| `form_submit` | Successful non-catering form (contact, careers) | `form_name`, `page_path` |
| `page_view` (SPA) | Every client-side route change after the first load | `page_path`, `page_location`, `page_title` |

Notes:
- **`order_click` = the outbound provider click** (the real "leaving to order"
  signal, tagged with which provider). The site's "Order Online" buttons in the
  nav/footer/hero link *internally* to `/order`; those are captured as `/order`
  `page_view`s, so the funnel reads: `/order` view → `order_click` (provider).
  If you also want a click event on the internal buttons, it's a one-line add.
- **`location`** is resolved data-driven by matching the link's phone /
  directions URL / provider URL against `lib/site-data.ts` — so it's correct per
  restaurant (Ossining / White Plains / Mount Vernon) wherever the link appears.

### SPA page views (why this matters)
Previously only ONE `page_view` fired per full page load; Next.js `<Link>`
navigations sent nothing, so internal pages were undercounted and funnels
couldn't be built. `AnalyticsProvider` now sends a `page_view` on each route
change (skipping the initial one, which `gtag('config')` already sends, to avoid
double-counting). This also **preserves UTM/campaign attribution across
client-side navigation**, because GA4 attribution is session-scoped once the
landing hit carries the UTMs (see §5).

---

## 2. Catering measurement + dollar value (priority)

The catering page has **two** forms (`catering-order` and `catering-inquiry`),
both submitting via `submitNetlifyForm()` (`lib/netlify-forms.ts`). On confirmed
success (`res.ok`), it **stashes** the conversion payload to `sessionStorage`
(`stashFormConversion`) and the events fire on **`/success`** load
(`ConversionTracker` → `flushStashedConversions`) — GA4's recommended
**`generate_lead`** plus a **`catering_request`** alias with:

- `value` — estimated dollar value (see logic below)
- `currency` — `"USD"`
- `location`, `form_type` (`build-order` / `quick-inquiry`), `event_type`,
  `guest_count`, `event_date`, `value_basis`, `page_path`

### Why the events fire on `/success` (not on submit)
Firing during the submit handler races the navigation to `/success`: the page
unloads before the gtag beacon is sent, so the conversion is lost (this is why
GA4 showed ~0 `catering_request`/`generate_lead` despite real Netlify
submissions). The submit now only **stashes** the payload to `sessionStorage`;
`/success` reads it back on load, fires both events (waiting for `gtag` to be
ready so the hit lands after `config`), and clears the stash.

### How `value` is derived (`computeCateringLeadValue` in `lib/analytics.ts`)
**Real cart total only.** The "Build Your Order" form is a cart with real
line-item prices; its total is written to a hidden `lead_value` field and used
directly (`value_basis: "cart_total"`). "Quick Inquiry" leads have no cart, so
they carry **no `value`/`currency`** — they are still counted as conversions
(`generate_lead`/`catering_request`) but contribute no revenue. We deliberately
do **not** estimate revenue from a per-head guess, so GA4 catering revenue
reflects only real quoted amounts. No constant to set.

### Why GA4 shows catering revenue $0 (and the two events)
If GA4 shows `generate_lead`/`catering_request` firing but **$0 revenue**, the
deployed build predates this value logic — production is running code without
`value`/`currency` on the event. Merging this branch fixes it; confirm in
DebugView that `generate_lead` arrives with a numeric `value` + `currency:"USD"`.

`catering_request` and `generate_lead` fire **on the same submission by design**
— `generate_lead` is GA4's recommended lead event (for value/revenue reporting),
`catering_request` is a domain-named alias for readable funnels. This is an
intentional alias, **not** double-counting a conversion. **Recommendation: make
`generate_lead` the single key event** (so value/revenue counts once) and keep
`catering_request` as a non-key event for segmentation — or vice-versa, but only
**one** should be a key event to avoid inflating conversion counts.

Netlify only captures form fields declared in `public/__forms.html`, so
`lead_value` was added there too — required for the field to persist.

---

## 3. SEO

Most schema/metadata was already strong (per-location `Restaurant` JSON-LD with
NAP/geo/hours, homepage `Restaurant` with `department[]`, full `Menu` schema with
priced items, catering `FoodEstablishment`, `FAQPage`; AI-crawler robots;
complete sitemap; crawlable HTML menu; descriptive image alts). Change made this
PR:

- **Homepage title + description** (`app/page.tsx`) retuned for local intent —
  leads with "Jamaican Restaurant in Westchester, NY" and names takeout /
  delivery / catering and the three towns, to lift CTR on "jamaican food near
  me" (2,860 impressions / 22 clicks / ~pos 9 baseline).

Indexability confirmed: the baseline's ~11 not-indexed pages are only
`/admin/*`, `/success`, and `/auth/callback` — all correctly non-indexable. Every
key page (home, menu, catering, order, locations) is in `sitemap.xml` and
allowed by `robots.txt`.

**Recommended follow-up (flagged, not built):** the single `/locations` page
renders three identical data-driven sections, so on-page "parity" is already
met. The high-value lever for local "near me" ranking is **dedicated
per-location landing pages** (`/locations/white-plains`, etc.) with unique
titles, local copy, and per-location schema. That's a larger build needing copy —
recommend scoping it as a separate PR.

---

## 4. Verification

### Already verified locally (production build) ✅
`next build` passes (clean type-check; `/`, `/menu`, `/catering`, `/order`,
`/locations` all remain **Static**). Every event was confirmed firing at runtime
against `next start`, observed via `window.dataLayer` (locally there's no GA ID,
so `trackEvent` uses its dataLayer fallback):

- `call_click` — with resolved `location`
- `order_click` — with `provider` (ubereats / ezcater) and `location`
- `directions_click` — per location (Ossining / White Plains / Mount Vernon)
- `menu_view` — on `/menu` load
- `generate_lead` + `catering_request` — `value: 480`, `value_basis: cart_total`,
  plus `event_type` / `guest_count` / `event_date` / `page_path`
- `page_view` — on SPA route change, no double-count on initial load

> ⚠️ Dev-mode note: `npm run dev` breaks hydration locally because Next's
> eval-based HMR is blocked by the site's CSP (no `unsafe-eval`). Verify against
> the **production** build (`npm run build && npm run start`), not `next dev`.
> Production has no eval, so CSP is satisfied — this is not a code issue.

### Still to confirm on the Netlify deploy preview (real GA4)
The above proves the wiring; the deploy preview (where `NEXT_PUBLIC_GA_ID` is set)
confirms the events reach the actual GA4 property:

1. Open the preview with `?debug_mode=1`, and open **GA4 → Admin → DebugView**
   (or the GA Debugger extension).
2. Exercise each action and confirm the event + params in DebugView:
   - Tap a location phone number → `call_click` (check `location`).
   - Click "Get Directions" on `/locations` → `directions_click`.
   - Click Uber Eats / EZCater on `/order` → `order_click` (check `provider`).
   - Load `/menu` → `menu_view`.
   - Build a catering order, submit → `generate_lead` + `catering_request` with
     `value` = cart total and `value_basis: "cart_total"`.
   - Submit a Quick Inquiry → `generate_lead` fires with **no** `value` (counted
     as a conversion, no revenue — inquiries have no cart).
   - Navigate between pages → one `page_view` per route change.
3. If `gtag` is present, events go to GA4. (When the GA script is absent — e.g. a
   preview without the env var — `trackEvent` falls back to a `dataLayer` push so
   you can still see events in the console via `window.dataLayer`.)

---

## 5. Manual steps for RPM (outside the code)

**GA4 admin (Admin → Events → mark as key event):**
- [ ] `catering_request` (and/or `generate_lead`) — the priority conversion
- [ ] `order_click`
- [ ] `call_click`
- [ ] `directions_click`
- [ ] `menu_view`

**Catering value:**
- Value now comes from the real cart total only (no per-head constant to set).
  Quick-Inquiry leads count as conversions with no dollar value.
- [ ] In GA4, confirm `generate_lead` value is being summed for Build-Your-Order
      leads (Reports → Monetization / a custom exploration on `value`).

> UTM handling (obj 6): GA4 attributes the **session** from the landing
> `page_view`'s UTMs, so campaign attribution survives the first internal
> `<Link>` click (it's session-scoped, not per-page). On top of that, the site
> now captures the landing UTMs once per session (`captureFirstTouchUtms`) and
> stamps them onto catering lead events, so an individual lead can be traced to
> the GBP/QR source that produced it. Internal link URLs are intentionally **not**
> rewritten (keeps the site's clean URLs intact). The remaining step is tagging
> the GBP/QR entry points below.

**Google Business Profile — paste as the "Website" link on each profile** (makes
GBP/Maps traffic legible instead of hiding in "Direct"):
- Ossining: `https://www.cravinjc.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=ossining`
- White Plains: `https://www.cravinjc.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=white-plains`
- Mount Vernon: `https://www.cravinjc.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=mount-vernon`

**QR codes on menus / receipts** (use per placement):
- `https://www.cravinjc.com/?utm_source=qr&utm_medium=offline&utm_campaign=in-store&utm_content=table-menu`
- `https://www.cravinjc.com/?utm_source=qr&utm_medium=offline&utm_campaign=in-store&utm_content=receipt`

(Optional: if you'd rather GBP show as "Referral" than "Organic" in GA4, change
`utm_medium=organic` to `utm_medium=referral` in the three GBP links. Keep it
consistent across all three.)

**Catering funnel exploration to build in GA4** (Explore → Funnel exploration):
1. Step 1: `page_view` where `page_path` = `/catering` (catering landing)
2. Step 2: `catering_request` (or `generate_lead`)
- Add `value` as the metric and `form_type` / `location` as breakdowns to read
  "catering sessions → requests → total request value" and per-location split.

**Deploy preview URL:** _(add the Netlify preview link here once the branch is
pushed — see "Next step" in the handoff.)_

---

# September 2026 traffic-review fixes

Branch `sept-2026-traffic-fixes` (stacked on the analytics branch). Objective 5
(per-location pages) is isolated on `restore-location-pages`, **unmerged, pending
RPM approval.**

## Obj 1 — Redirect audit & the 404
The single Search Console 404 was **`/cart`** (retired order cart, no route, no
redirect). Added `/cart → /catering` (301). All other retired URLs were already
correct single-hop 301s. Verified against a local production build:

| Retired URL | Status | Destination | Action |
|---|---|---|---|
| `/cart` | ~~404~~ → **301** | `/catering` | **added redirect (the 404)** |
| `/order-online` | 301 | `/order` | already correct |
| `/ossining` | 301 | `/locations#ossining` | already correct¹ |
| `/white-plains` | 301 | `/locations#white-plains` | already correct¹ |
| `/mount-vernon` | 301 | `/locations#mount-vernon` | already correct¹ |
| `/contact-us` | 301 | `/contact` | already correct |
| `/about-us` | 301 | `/about` | already correct |
| `/menu/` | 308 | `/menu` | Next auto trailing-slash (permanent) |

¹ Objective 5 (if approved) converts these three back into real pages and
removes their redirects. Sitemap/robots/canonicals confirmed clean; no chains.

## Obj 2 — Catering value
See §2 above. Value comes from the **real cart total only** (Build Your Order);
Quick-Inquiry leads count as conversions with no dollar value (no per-head
estimate). `generate_lead` + `catering_request` firing together is an intentional
alias — make **one** the key event. GA4 $0 revenue = production predates the
value logic; merging fixes it. **Verified locally**: a Build-Your-Order
`generate_lead` carries `value` + `currency:"USD"` (e.g. 725, `cart_total`).

## Obj 3 — Directions tracking
Already resilient — the global delegated listener (`AnalyticsProvider`) fires
`directions_click` for any Google-Maps directions link, with `location`.
**Verified locally**: clicking all three location directions links → 3 events
with correct `location`. (Production's "3 in a month" reflects code predating
this delegated listener.) `order_click` / `call_click` / `menu_view` share the
same resilient mechanism.

## Obj 4 — /locations conversion
Each location now has a **Call to Order / Order Delivery / Get Directions** CTA
row, each wired to its GA4 event with `location`. Per-location `Restaurant`
JSON-LD already present. **Verified locally** on `/ossining` page: all three
events fire with `location: "Ossining"`.

## Obj 5 — Per-location pages (ISOLATED, pending approval)
On branch `restore-location-pages`: restored `/ossining`, `/white-plains`,
`/mount-vernon` as real pages (unique title/description + single `Restaurant`
schema + Call/Order/Directions CTAs); `/locations` becomes a hub; the three old
redirects removed; sitemap updated. **Redirect implication**: those slugs stop
redirecting and serve pages. Copy is functional but light — RPM may want richer
per-town copy + photos. **Not merged.**

## Obj 6 — UTM legibility
GA4 preserves session attribution across client-side nav already. Added
first-touch UTM capture stamped onto catering leads. **Verified locally**: a lead
submitted after landing on `/?utm_source=google&utm_campaign=gbp` carried those
UTMs on `generate_lead` alongside `value`. GBP/QR tagged links are in Manual
steps above.

## Obj 7 — Form abandonment (investigate only, no code)
`form_start` 41 / `form_submit` 7 (Aug). No blocking bug found. Most likely
friction: **phone is a required field on both catering forms** (the contact form
makes it optional) — a known drop-off point — and the build-order form is long on
mobile (75% of users). `form_start` fires on first field focus, so a 6:1 ratio on
small numbers partly reflects casual exploration. **Recommend** (not done): make
phone optional on catering forms, and use GA4's `form_id` breakdown on
`form_start`/`form_submit` to pinpoint the worst-converting form before changing
anything.
