# GLAD Detailing website redesign

Static HTML, CSS, and JavaScript, ready for GitHub Pages. No build step or runtime dependencies.

## Editing the website

The source uses two-space indentation, readable HTML attributes, and one CSS declaration per line. HTML comments label the main page sections; CSS comments mark shared components and page-specific styles. Search for the visible section heading or the relevant CSS class to find what you want to edit.

| What you want to change | Where to edit |
| --- | --- |
| Homepage text, photos, and sections | `index.html` |
| Services and package cards | `packages.html` and the four `*-car-detailing-gainesville.html` / `in-and-out-detailing-gainesville.html` pages |
| Membership Club copy and benefits | `membership.html` |
| Gallery and Instagram invitation | `gallery.html` |
| About pages | `about.html` and `about-me.html` |
| Colors and fonts | The `:root` variables at the top of `styles.css` |
| Spacing, layout, buttons, animations, and mobile styles | The labeled sections and `@media` blocks in `styles.css` |
| Booking form fields and confirmation markup | `booking-form.mjs` — the form HTML is created here, not inside `book.html` |
| Membership application fields and confirmation markup | `membership-form.mjs` |
| Membership display prices and vehicle tiers | `CLUB_PRICES` and `CLUB_VEHICLES` in `membership-utils.mjs` |
| Shared navigation and footer | The labeled header/footer blocks in each HTML page |
| SEO titles and descriptions | The `<head>` of each HTML page |

Keep CSS rules in their current order: later overrides and responsive rules depend on it. When editing navigation or footer links, update every page that uses them. For package prices, keep the HTML `data-prices` values, service-page text, and JSON-LD offers consistent. Membership price changes also need the matching Google receiver configuration updated; changing the display alone does not change the server-calculated application quote.

Formatting is optional editing tooling; the website still runs directly from these static files. From this folder, install the formatter once and use:

```sh
npm install
npm run format
npm run format:check
```

`.prettierrc.json` stores the formatting rules, and `.editorconfig` defines indentation and line endings. An editor's Prettier integration can use the same configuration when you format a file. The `/* HTML */` comments in the form modules tell Prettier to format the HTML inside JavaScript template strings too.

To preview with a local HTTP server, run `python3 -m http.server 8765` from this folder, then visit `http://127.0.0.1:8765/`. If that server is already running, use its existing address. Membership applications on localhost remain preview-only.

## Included

- Ferrari red buttons and accents, with a complementary forest blue hero headline.
- Membership prices explicitly labeled as monthly costs for monthly, bi-weekly, and weekly visits.
- Eight-photo rotating gallery surrounding a centered Instagram invitation, with pause/play and reduced-motion support.
- Thirteen pages, including four dedicated Gainesville service pages, a direct booking page, a Membership Club page, and a custom 404 page.
- Confirmed service areas and Monday–Saturday, 8 a.m.–7 p.m. appointment hours.
- Unique titles/descriptions, production canonical URLs, Open Graph metadata, Organization/Service/Offer/Breadcrumb JSON-LD, robots.txt, and a current sitemap.
- Responsive WebP image variants with explicit dimensions, lazy loading below the hero, and prioritized hero imagery.
- Direct GA4 integration for measurement ID `G-1G04ECDY81`, with page views, booking starts, booking-page views, package/vehicle selection, calls, texts, and a lead event after the server acknowledges a saved request. Only the production HTTPS domains load Google’s tag; local previews send no analytics requests. A saved request is distinct from a confirmed appointment.
- Branded website booking forms save validated requests to the existing private Google Sheet through Google Apps Script; no Google Form iframe is displayed.
- All nine website photographs retouched with built-in image generation for balanced lighting, color, and detail, including the Ferrari and founder portrait; optimized JPEGs are in `assets/`.
- Scroll reveals, animated marquee, hover treatments, and reduced-motion support.
- Vehicle-size pricing, expandable service details, and gallery photo dialogs.
- Matching booking page and dialogs, with preserved package/vehicle selection, phone and availability fields, optional add-ons, and booking-related text consent.
- Mobile booking/text bar, accessible navigation, and a dismissible booking reminder after 35 seconds and meaningful scroll progress. The reminder is limited to once per browser session.
- Existing business phone, Instagram, pricing, custom domain, and privacy policy content retained.

## Review and validation

The approved redesign was reviewed earlier in Chrome. Per the owner's preference, the subsequent SEO iteration has not been browser-tested. Programmatic checks cover links and fragments across all 13 pages, unique metadata and canonical URLs, 12 JSON-LD graphs, confirmed hours/service areas, responsive image dimensions, the sitemap, JavaScript syntax, and 20 package/vehicle booking-prefill combinations plus invalid-input cases.

The four service pages and direct booking page are linked from the existing navigation, package cards, and footer. Home links use `/`; `/index.html` remains available with `/` as its canonical URL. No unsupported server redirects are assumed on GitHub Pages.

This source is prepared for the existing GitHub Pages site at https://gladdetailing.com/. Publish through the repository’s main branch and verify the resulting Pages deployment. Search Console submission, Business Profile changes, GA4 account-side custom dimensions, and verification of received analytics events are separate account-side launch steps.

## Analytics

`analytics.js` loads before `app.js` on all 13 pages. It configures GA4 once, and sends only the approved lead-intent event categories and fields. It honors the standard Google Analytics opt-out flag, excludes arbitrary URL parameters from page URLs, disables advertising signals/personalization, and leaves local previews untracked. GA4 receipt, account-side custom dimensions, and key-event settings must be verified after publication.

Isolated Node checks cover production-host routing, no preview requests, event payload filtering, duplicate initialization, opt-out behavior, booking acknowledgements, validation, and duplicate/uncertain-save handling. These tests do not contact Google or prove receipt in the GA4 property.

## Booking connection

`booking-config.mjs` contains only the public Google Apps Script web-app URL. Google credentials and the Mac outreach scripts are never included in this repository. The receiver validates requests, uses the existing 15-column sheet layout, and only acknowledges a request after saving. The existing Mac sender sends the first introduction and marks it sent; customer replies are handled by Miguel. The Mac must be awake, online, and connected to its existing Messages setup for automatic outreach.

Receiver checks include required text consent, allowed service/vehicle/area/day values, a form-session challenge, a honeypot, phone/global rate limits, spreadsheet formula escaping, exact schema checks, a save lock, and idempotent request IDs. Unknown save outcomes prompt contact by text rather than claiming success or creating a second row. Customer data is never sent in the analytics payload.

## Membership Club

`membership.html` contains dedicated membership pricing, confirmed loyalty benefits, and an application form. Shared navigation and footer links include Membership Club. Localhost submissions are explicitly preview-only: no sheet write, text, or live analytics event is produced. The membership connection targets its own private sheet and uses a separate receipt-only Mac worker. Applying never enrolls, charges, or approves the applicant. The owner reviewed the local preview and approved publication on October 16, 2026.

The private membership receiver is deployed and verified with a cleaned-up diagnostic application; no test text was sent. The owner activated the separate once-per-minute Mac receipt LaunchAgent; successful runs and an empty pending queue were verified. Membership receipt delivery has not been tested with a real phone number. The ordinary booking sender is unchanged.
