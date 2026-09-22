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
| `form_success` | Successful non-catering form (contact, careers). Was `form_submit` until 2026-09-21 | `form_name`, `page_path` |
| `page_view` (SPA) | Every client-side route change. **Since 2026-09-21 this comes from GA4 Enhanced measurement, not site code** (see the 2026-09-21 section) | `page_location`, `page_referrer`, `page_title` |

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
> **Superseded 2026-09-21.** The premise below was wrong for this property: GA4
> Enhanced measurement "page changes based on browser history events" is on, so
> `<Link>` navigations already sent a page_view. The manual one doubled them. It
> was removed; see "2026-09-21 revised interim hand-off" at the end of this file.

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
- `page_view` — on SPA route change, from GA4 Enhanced measurement (exactly one per navigation since 2026-09-21)

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

---

# Mid-September 2026 interim fixes

Branch `sept-interim-fixes`. Addresses the 2026-09-14 interim hand-off. Several
items were already resolved by earlier PRs — flagged below so nothing is
"re-fixed" as a no-op.

## Obj 1 — Catering `currency` / $0.00 revenue — NOT a code bug
**Verified empirically** (local production build, real submit): `generate_lead`
fires with `currency: "USD"` **and** `value` together (e.g. `{currency:"USD",
value:1250, value_basis:"cart_total", ...}`). One dispatch path; `clean()` does
not strip it; no consent gate. **Currency is being sent.**

The $0.00 is GA4 metric semantics, not the site: **`generate_lead`'s `value`
populates the "Event value" metric (the 3,166 the investigation saw), never
"Total revenue".** Only purchase-type events feed Total revenue. Adding/confirming
currency cannot change that — it is already correct.

**To see catering lead value:** use **Event value**, or an Exploration summing
`generate_lead`'s `value` (works today). If a true "Total revenue" figure is
wanted, the only correct way is to fire a `purchase` event for *booked* catering
orders — not recommended for leads, since a lead is not a completed sale.

## Obj 3 — Per-location page indexing
Pages were already 200 (no redirect), self-canonical, in the sitemap, and carry
`Restaurant` JSON-LD. Added the missing piece: **internal links** from the
homepage location cards (`Details` → `/ossining` etc.) and the footer Company
column. Submitting the three URLs for indexing is a Manual step.

## Obj 4 — Directions tracking
Not a wiring gap: the click listener is **document-delegated (global)** and
already covers the restored pages. **Verified**: on `/white-plains`,
`directions_click`/`call_click`/`order_click` all fire with `location:"White
Plains"`. The low count is user behaviour, not tracking. Lever is UX
(prominence), not code.

## Obj 5 — `/about:*Our`
No internal source generates it (all `/about` links are clean). It already
**404s**; it reached GA4 because the 404 page loads GA via the root layout.
No code change.

## Obj 6 — Keep /admin out of analytics
**Fixed.** `GoogleAnalytics` + `AnalyticsProvider` are now wrapped in
`HideOnAdmin`, so GA does not load on `/admin` at all (no page_view, no events —
this stops `/admin/staff/<uuid>` internal ids reaching GA4). `/admin` added to
`robots.txt` disallow; pages were already metadata `noindex` + auth-gated.

## Obj 7 — UTM
First-touch UTMs are captured on landing and stamped onto catering leads.
**Verified**: landing on `/?utm_content=ossining` → `generate_lead` carried
`utm_content:"ossining"`. GA4 also attributes the session natively from the
landing page_view. `utm_content` reaches GA4 as an event param on leads.

## Obj 8 — Was the per-location restore intended?
**Yes.** `git` shows PR #3 (`restore-location-pages`) merged into `main` by
`rmurdock1` (repo owner) on 2026-09-01. Owner-approved merge, not a stray branch.

## Obj 2 — The single 404 (still open — needs Search Console)
All 11 sitemap URLs return 200; all known retired URLs 301 correctly; `/cart` is
fixed. The remaining 404 is a URL Google discovered historically that is not in
our redirect map. **It cannot be identified from code** — it requires Search
Console → Page indexing → Not found (404) → sample URLs (no GSC access in this
session). Once RPM provides the URL, a one-line 301 fixes it.

## Obj 9 — Per-head placeholder
The `$25/guest` constant was **already removed** in PR #5 (2026-09-01,
RPM-approved). Inquiry leads carry no value by design. Nothing to leave/flag.

---

# 2026-09-21 revised interim hand-off

Branch `analytics-sept-interim`. Covers the mid-September interim hand-off as
revised on 2026-09-21. Each objective was audited against the code, git
history, the live site and Google's docs before anything changed. Several
premises in the hand-off didn't hold, so each objective below says what is true.

| Commit | Obj | Change |
|---|---|---|
| `ae09540` | 7 | Removed the manual SPA page_view (it double-counted every in-site navigation) |
| `3963fc6` | 6 | GA4 hits blocked on `/admin` even when gtag is already loaded |
| `1a1fc5b` | 3 | Location JSON-LD fixes; Contact "Details" links go to the location pages |
| `864e395` | 4 | Addresses on the homepage, `/contact` and `/order` link to directions; right-clicks no longer count |

## Obj 1: catering `currency` is already sent; the pass/fail metric can't move
- **Payload, re-checked 2026-09-21** (localhost, Netlify POST stubbed, no real
  lead): `generate_lead` = `{currency: "USD", value: 95, value_basis:
  "cart_total", form_type: "build-order", location: "Ossining", …}`. The live
  bundle has the same code. `currency` has gone out with every valued lead
  since `generate_lead` first reached `main` (PR #1, 2026-09-01 16:08 EDT). No
  wrapper strips it; `clean()` only drops empty values.
- **Why Total revenue is $0.00:** GA4's Total revenue is purchases + in-app
  purchases + subscriptions + ad revenue
  ([9143382](https://support.google.com/analytics/answer/9143382)). "Only events
  about purchases, in-app purchases, subscriptions, and ad revenue can have
  total revenue"
  ([12926615](https://support.google.com/analytics/answer/12926615)). A lead
  never feeds it, so the success line "Total revenue no longer $0.00 for
  generate_lead" cannot pass. Don't add a `purchase` event to force it; a lead
  isn't a sale.
- **The right check:** Reports → Engagement → Events → customize → add the
  **Event value** metric, filter to `generate_lead`. It should equal the sum of
  build-order cart totals in Netlify Forms for the same dates (the 3,166 already
  seen is this). Per-key-event value: Admin → Data display → Events → Key events.
- No code change.

## Obj 7: page views were double-counted since 2026-09-01 (fixed)
- **Seen live on 2026-09-21** by capturing the GA4 hits on www.cravinjc.com:
  `/about` → `/locations` → `/menu` through nav links sent **two** `page_view`
  hits per navigation. One came from `AnalyticsProvider`'s manual page_view, the
  other from gtag's Enhanced measurement history listener. That listener is on
  in the live G-RQE3YPW3DM config. `menu_view` fired once. The manual page_view
  is removed; GA4's own history page_view is kept (Google's recommended SPA
  setup).
- **Reporting impact:** Views, views per session and events per session are
  inflated for in-site navigations from 2026-09-01 until this deploys. The
  hand-off's "page views +34%" and "events per session 4.50 → 6.05" compare Sep
  1–9 with Aug 1–9, which is before the manual page_view reached `main`, so part
  of that growth is this artifact. Sessions, users, key events and attribution
  are unaffected. **Expect Views to drop at deploy.**
- **UTMs across navigation:** nothing to fix. A GA4 session keeps the landing
  hit's source, medium, campaign and ad content
  ([11242841](https://support.google.com/analytics/answer/11242841)), so later
  page views without UTMs don't change it. `captureFirstTouchUtms` still stamps
  `utm_*` onto catering leads.
- **`utm_content` custom dimension:** only `generate_lead` and
  `catering_request` carry a `utm_content` event parameter, so the event-scoped
  dimension reads "(not set)" on everything else. The built-in **Session manual
  ad content** dimension already applies `utm_content` to every event in the
  session; use that. If the custom dimension must fill on every event, a
  one-line `gtag('config', ID, { utm_content })` from the stored first-touch
  UTMs would do it (not done).
- **Renamed `form_submit` → `form_success`** (RPM's call, 2026-09-21).
  Enhanced measurement form interactions send their own `form_submit`, and the
  site's success event for contact and careers forms had the same name, so
  GA4's `form_submit` count mixed the two. Now:
  - `form_submit` is GA4's automatic event: a submit attempt on any form,
    including catering, with `form_id` and `form_name`.
  - `form_success` is the site's event: a contact or careers form that actually
    reached Netlify and landed on `/success`, with `form_name` `contact` or
    `careers-application`.
  - `form_submit` counts before the deploy date include both.

## Obj 6: `/admin`
- **noindex:** already on every admin route (`app/admin/layout.tsx`); live on
  `/admin/login`.
- **Auth:** checked live on 2026-09-21. `/admin`, `/admin/staff`,
  `/admin/postings`, `/admin/applicants` and `/admin/team` all 307 to
  `/admin/login` without a session (GET and HEAD). Admin pages and server
  actions check auth again on the server. There are no admin API routes.
- **Leak fixed:** `HideOnAdmin` stops GA loading when `/admin` is the first page,
  but `next/script` never unloads gtag. The path admin → public page (e.g.
  Postings' "careers page" link) → Back returned to `/admin` with gtag running.
  Its history page_views would record `/admin/staff/<uuid>`, and its
  outbound-click events would record the Team page's "Open in Gmail" link, which
  contains the invitee's email address. `GoogleAnalytics.tsx` now defines
  `window['ga-disable-G-RQE3YPW3DM']` as a getter that is true on `/admin` paths.
  That is GA's official opt-out flag, and the live gtag.js checks it on every
  hit. Verified on the PR #20 deploy preview with the real tag: while on
  `/admin/login`, neither gtag's history page_view nor a direct `gtag('event')`
  was sent. Back on a public path, both were sent.
- **Referrer (pre-existing, reduced):** the first public page view after leaving
  admin can carry the admin URL as `page_referrer`. The Postings page's link to
  the careers page, the one admin → public link, now opens in a new tab with
  `rel="noreferrer"`, so it doesn't do this. Back/Forward from an admin page to a
  public page still can; that's rare, and it only exposes the referrer.
- **robots.txt `Disallow: /admin` kept.** Note: Google only obeys a noindex it's
  allowed to crawl, so an externally linked admin URL could still show as a bare
  URL. Admin URLs aren't linked publicly and all redirect to login, so the risk
  is small; dropping `/admin` from the disallow list is the textbook option.

## Obj 3: location pages
- **Already correct:** all three return 200, have self-canonical URLs and are in
  the sitemap. They're linked from the homepage cards, the `/locations` hub, the
  footer on every page and each other's pages. No redirect, canonical or sitemap
  change.
- **Fixed in the JSON-LD:**
  - `dayOfWeek` was `"Mo"`, `"Tu"`… Google accepts only `"Monday"` or
    `https://schema.org/Monday`
    ([docs](https://developers.google.com/search/docs/appearance/structured-data/local-business)),
    so the hours could be ignored.
  - Sunday is now marked closed with `00:00`/`00:00`.
  - `telephone` has `+1-`.
  - Each location's `url` and `@id` are its own page on `/locations` and the
    homepage too.
  - `acceptsReservations` is a boolean.
- The Contact page "Details" buttons now link to `/ossining`, `/white-plains`
  and `/mount-vernon`.
- The real fix for indexing is Request Indexing (manual step).

## Obj 4: directions
- Tracking is correct and document-delegated. It covers every page, including
  the restored ones, with `location` set.
- The gaps were missing places to click. Only `/locations` and the three
  location pages had a directions link. Taps inside the embedded Google Maps
  iframes can't be seen by the site, so treat `directions_click` as a lower
  bound.
- The address on the homepage, `/contact` and `/order` now links to directions
  and fires `directions_click` with the right `location`. It's styled like the
  phone link next to it.
- The listener no longer counts right-clicks (only a middle-click opens a link).
- `order_click`, `call_click` and `menu_view` fire on the restored pages.
- Cross-check: GA4's automatic outbound `click` events to google.com/maps.

## Obj 5: `/about:*Our`
Nothing in the repo produces it. `public/llms.txt` writes "Our story:
https://www.cravinjc.com/about". Live, `/about:*Our` returns 404 with noindex.
The most likely source is an outside page or chat where "about: *Our Story*"
text got auto-linked. The 404 page loads GA, so human visits record the path.
No change.

## Obj 2: the Search Console 404 (closed)
`https://www.cravinjc.com/&opi=79508299&sa=U&ved=0ahUKEwiWgsSF9OeTAxWUgv0HHc98MDcQ61gIFygQ&usg=AOvVaw2w_67LXIHm04mc6Em3F0xd`
is Google's own result-click tracking glued onto the path. It returns 404 with
noindex, which is correct. No redirect.

## Obj 8: how the per-location restore reached production (facts only)
- One commit, `b90e75c` (2026-09-01 15:44 EDT, branch `restore-location-pages`),
  created all three pages and `LocationPageContent`. It also removed the three
  `/<slug>` → `/locations#<slug>` redirects added in `a3a1153` (2026-07-06).
- It went in through **GitHub PR #3**, titled "[PENDING APPROVAL] Restore
  per-location pages (obj 5)", whose body opens "PENDING RPM APPROVAL — DO NOT
  MERGE YET". PR #2's body also listed it as "unmerged, pending RPM approval".
- The GitHub timeline shows the `rmurdock1` account changed PR #3's base from
  `sept-2026-traffic-fixes` to `main` at 20:31:59Z on 2026-09-01. The same
  account merged it 28 seconds later, at 20:32:27Z (merge `68d137a`). There were
  no reviews, comments or deploy preview.
- Production builds from `main` automatically, so it most likely went live at
  about 16:32 EDT that day.
- The 2026-09-14 section above called this "owner-approved". What the record
  actually shows is a merge by the owner's account. Whether that was a
  deliberate approval is RPM's call. Nothing was reverted.

## Obj 9: per-head placeholder
There's nothing to flag. The `$25/guest` constant (`CATERING_VALUE_PER_GUEST_USD`)
was removed in `a5a2ea4`, which reached `main` via PR #5 on 2026-09-01 "Per
RPM". Build-order leads carry the real cart total; quick inquiries carry no
value by design.

## Redirect and indexing audit (live, 2026-09-21)
| URL | Status | Destination | Canonical | In sitemap | Action |
|---|---|---|---|---|---|
| `/index.html` | 301 | `/` | `/` | dest yes | none |
| `/menu.html`, `/catering.html`, `/order.html`, `/locations.html`, `/about.html`, `/contact.html` | 301 | clean path | self | dest yes | none |
| `/success.html` | 301 | `/success` (noindex, robots-disallowed) | none | no (correct) | none |
| `/home`, `/about-us`, `/contact-us`, `/order-online`, `/menu-2` | 301 | `/`, `/about`, `/contact`, `/order`, `/menu` | self | dest yes | none |
| `/cart` | 301 | `/catering` | self | dest yes | none |
| `https://cravinjc.netlify.app/`, `https://cravinjc.com/` | 301 | `https://www.cravinjc.com/` | `/` | n/a | none |
| `http://cravinjc.com/` | 301 → 301 | `https://cravinjc.com/` → www (2 hops, Netlify domain level) | `/` | n/a | optional |
| `/`, `/menu`, `/catering`, `/order`, `/about`, `/careers` | 200 | none | self | yes | none |
| `/locations` | 200 | none | self | yes | JSON-LD fixed (`1a1fc5b`) |
| `/contact` | 200 | none | self | yes | Details → location pages (`1a1fc5b`) |
| `/ossining` | 200 | none | self | yes | JSON-LD fixed; already indexed |
| `/white-plains` | 200 | none | self | yes | JSON-LD fixed; **Request Indexing** |
| `/mount-vernon` | 200 | none | self | yes | JSON-LD fixed; **Request Indexing** |
| `/&opi=79508299&sa=U&ved=…&usg=…` | **404** (noindex) | none | none | no | none (see Obj 2) |

## Manual steps for RPM
- [ ] **Request Indexing** (Search Console → URL Inspection) for
      `https://www.cravinjc.com/white-plains` and
      `https://www.cravinjc.com/mount-vernon`. This is the fix for the
      location-page gap. It takes about two minutes.
- [ ] **Change the revenue check:** measure catering value with **Event value**
      on `generate_lead`, not Total revenue (Obj 1).
- [ ] **Add a GA4 annotation on the deploy date:** "Removed duplicate SPA
      page_view; Views drop expected." Keep Enhanced measurement → Page views →
      "Page changes based on browser history events" **on**, because it is now
      the only source of in-site page views.
- [ ] After deploy, check with Tag Assistant or DebugView that one internal
      click sends **one** page_view.
- [ ] Authorise one real build-order test submission (`?debug_mode=1`) if you
      want DebugView proof of `currency=USD`. Staff will receive that lead.
- [ ] Use **Session manual ad content** for `utm_content` reporting (Obj 7).
- [ ] Paste the tagged links into the Ossining and White Plains Google Business
      Profiles (Contact → Website), and confirm Mount Vernon's pending edit was
      accepted:
      - Ossining: `https://www.cravinjc.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=ossining`
      - White Plains: `https://www.cravinjc.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=white-plains`
- [ ] Run Google's Rich Results Test on `/white-plains` from the deploy preview
      or production.
- [ ] Answer Obj 8: was the PR #3 merge intended?
- [ ] Optional: say whether to remove `/admin` from the robots.txt disallow
      (Obj 6).
- [ ] If any GA4 exploration or custom report counts contact or careers
      successes with `form_submit`, switch it to `form_success` (renamed
      2026-09-21). No key event uses it.

---

# 2026-09-21 hand-off, second revision (RPM's measurement decisions)

The re-revised hand-off closes Obj 1 (catering value is read with **Event
value**; the payload stays as it is) and narrows Obj 7 to one item: UTM
survival through client-side routing. The standing decisions live in
`reporting-conventions.md`, which is not in this repo. Everything else was
already shipped in PR #20 (see the section above).

## Obj 7: UTM survival through client-side routing
**Method (nothing sent to GA4):** headless Chrome with phone emulation (fast
4G, CPU slowed 4x) landed on
`/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=ossining`
and tapped Menu. Every GA4 hit gtag.js tried to send was intercepted,
recorded and blocked, so no fake "gbp / ossining" session reached the
property.

**Result on production before this fix:**

| Visitor | gtag.js load | First hit of the session (`_ss`) | Attributed |
|---|---|---|---|
| Taps Menu after 5 s | normal | `dl=/?utm_…content=ossining` | ✅ gbp / ossining |
| Taps as soon as the page is interactive | normal | `dl=/?utm_…` (sent just before the URL changed) | ✅ |
| Taps before the page is interactive | normal | `dl=/?utm_…` | ✅ |
| **Taps as soon as interactive** | **held 2 s (slow network)** | **`dl=/menu`, no UTMs, no referrer** | ❌ **Direct** |
| **Taps before interactive** | **held 2 s** | **`dl=/menu`, referrer internal** | ❌ **Direct** |

In the normal cases the tags survive: every later hit shares the session ID,
and GA4 keeps the landing campaign for the whole session. The URL losing its
query string after the first click doesn't matter. What loses attribution is
a race. gtag.js reads the page URL when it *processes* its queued `config`,
not when the site queued it. If gtag.js arrives after a fast tap, the
session's first hit reports the page the visitor moved to.

**Fix (this branch):** `app/layout.tsx` records `window.__landingHref` while
`<head>` parses. `GoogleAnalytics.tsx` now runs `config` with
`send_page_view: false` and sends the first `page_view` explicitly with
`page_location` set to that landing URL. Two things were checked with the
real gtag.js and G-RQE3YPW3DM (hits blocked) before choosing this:
- Enhanced measurement history page_views still fire with
  `send_page_view: false`. Later events report the current page.
- Putting `page_location` in `config` instead is wrong. It sticks, and a
  later event on `/menu` reported the landing URL.

**Remaining gap (accepted):** a tap *before* hydration triggers a full page
load. If gtag.js hasn't arrived by then, the landing page's queued hit is
discarded along with the page. That needs a tap within the first ~0.5–1 s on a
slow connection, and can't be fixed without hand-sending hits, which the
"one analytics install" rule rules out.

**Also checked:** the apex domain, `cravinjc.netlify.app` and `http://`
redirects all keep the full UTM query string.

## Decisions carried out
- **Obj 1:** payload unchanged. It already sends `value` plus
  `currency: "USD"` on build-order leads; nothing was added or removed.
- **Obj 7:** nothing is wired to the custom `utm_content` dimension. The
  built-in **Session manual ad content** reads standard UTMs from the session's
  first hit, and this fix protects that hit.
- **Obj 9:** there's still no `$25/guest` constant to keep (removed in PR #5,
  2026-09-01, per RPM), so there's nothing to flag.

## Manual steps for RPM (updated)
- [x] Request Indexing for `/white-plains` and `/mount-vernon`: done
      2026-09-21.
- [x] Tagged links on all three Google Business Profiles: done 2026-09-21.
      Spot-check that Ossining's and White Plains' pending edits went live.
- [ ] After this deploys, confirm **Session manual ad content** starts showing
      `ossining`, `white-plains` and `mount-vernon` (Explore → free form,
      filter Session campaign = `gbp`).
- [ ] Answer Obj 8: was the PR #3 merge intended?
- [ ] Optional: remove `/admin` from the robots.txt disallow (see Obj 6 above).
