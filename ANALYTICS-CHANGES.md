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
ready so the hit lands after `config`), and clears the stash. `value` comes from
`lead_value`/`cart_total` for orders and the per-head estimate for inquiries —
never hardcoded.

### How `value` is derived (`computeCateringLeadValue` in `lib/analytics.ts`)
In priority order:
1. **Real cart total** — the "Build Your Order" form is a cart with real
   line-item prices. Its total (in `lib/hooks useCateringCart`) is written to a
   new hidden `lead_value` field and used directly. `value_basis: "cart_total"`.
   *This is a true estimate, not a guess — better than a flat per-head number.*
2. **Guest estimate** — "Quick Inquiry" has no cart. If `guest_count` is given,
   `value = guest_count × PER_GUEST_ESTIMATE_USD`. `value_basis: "guest_estimate"`.
3. **Placeholder** — neither present → `FALLBACK_CATERING_LEAD_VALUE_USD`.
   `value_basis: "placeholder"`.

### ⚠️ Constants to set before trusting revenue (top of `lib/analytics.ts`)
```ts
export const PER_GUEST_ESTIMATE_USD = 20;          // PLACEHOLDER — hero says $15–25/pp
export const FALLBACK_CATERING_LEAD_VALUE_USD = 500; // PLACEHOLDER — avg lead value
```
`PER_GUEST_ESTIMATE_USD` only affects Quick-Inquiry leads that include a guest
count; Build-Your-Order leads already carry the real cart total. **RPM: set the
real blended per-head figure and a sensible fallback.**

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
   - Submit a Quick Inquiry with a guest count → `value_basis: "guest_estimate"`.
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
- [ ] Set `PER_GUEST_ESTIMATE_USD` and `FALLBACK_CATERING_LEAD_VALUE_USD` in
      `lib/analytics.ts` to real figures.
- [ ] In GA4, confirm `generate_lead` value is being summed (Reports →
      Monetization / or a custom exploration on `value`).

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
