# usaeventpartner.com

SEO-first lead-generation site for international brands, agencies and marketing teams that need a reliable local event-production partner in the United States.

## Selected art direction

**Corporate US × Network Edition (1+3).**

The site uses the proven structural logic of `merch.mt` / `corp-merch.eu`, but the visual system is distinctly American B2B: navy, federal blue, warm white, steel, teal and a restrained signal-red accent. It keeps the existing network's conversion architecture without looking like a recolor.

Primary positioning:

> You bring the event. We handle the US.

## Production routes

- `/` — full US event-production homepage
- `/trade-show-support-us/` — focused high-intent trade show / exhibitor support page
- `/api/lead` — validated lead endpoint handled by the Cloudflare Worker
- `/robots.txt` and `/sitemap.xml` — production crawl controls

## Project structure

- `src/content.mjs` — positioning, services, projects, FAQ and contact details
- `src/styles.css` — responsive Corporate US × Network design system
- `src/script.js` — navigation, privacy-safe analytics events and lead-form states
- `src/assets/images` — optimized WebP project photography plus social preview
- `src/_worker.js` — canonical redirect, preview noindex and email lead delivery
- `scripts/build.mjs` — dependency-free static HTML build and structured-data generation
- `scripts/check.mjs` — production anti-regression, SEO, asset and Cloudflare checks
- `scripts/test-worker.mjs` — Worker contract tests
- `docs/HANDOFF.md` — launch and operations checklist
- `docs/seo-geo-implementation-report.md` — SEO/GEO coverage and next-growth plan

## Local development

```bash
npm install
npm run build
npm run check
npm run test:worker
npm run dev
```

The build/check/test scripts themselves are dependency-free; Wrangler is only required for local Worker preview and deployment.

## Lead delivery

The form posts to `/api/lead`. The Worker validates required fields, checks origin, uses a honeypot and form-age guard, applies a lightweight per-IP cooldown and sends the enquiry through the Cloudflare Email Service binding `LEAD_EMAIL`.

- Destination: `order@swaggy.agency`
- Sender configured in code: `leads@usaeventpartner.com`
- Reply-To: visitor's submitted email

Cloudflare must authorize the destination and sender before the end-to-end production test.

## Analytics

Create a dedicated GA4 web stream for `usaeventpartner.com` and expose the ID as GitHub Actions variable `GA4_MEASUREMENT_ID`.

Implemented events include:

- `hero_cta_click`
- `header_cta_click`
- `service_cta_click`
- `concierge_cta_click`
- `emergency_cta_click`
- `form_start`
- `form_submit`
- `telegram_click`
- `email_click`
- `project_gallery_view`

Names, emails, company names, event details and free-form briefs are never sent as analytics parameters.

## Cloudflare deployment

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Required GitHub Actions variable:

- `GA4_MEASUREMENT_ID`

The workflow builds and validates on every push to `main`. Production deployment runs only when all three values exist.

Production custom domains are configured in `wrangler.jsonc`:

- `usaeventpartner.com`
- `www.usaeventpartner.com` → permanently redirected to apex

Every `*.workers.dev` response receives `X-Robots-Tag: noindex, nofollow`; preview `robots.txt` disallows crawling.

## Release gate

1. Create the dedicated GA4 stream and set `GA4_MEASUREMENT_ID`.
2. Add Cloudflare repository secrets.
3. Authorize Email Service delivery for `order@swaggy.agency` and `leads@usaeventpartner.com`.
4. Run the workflow and verify the preview / production Worker.
5. Test one real lead end to end and confirm Reply-To.
6. Verify apex + `www` custom domains and the permanent redirect.
7. Add Google Search Console and submit `https://usaeventpartner.com/sitemap.xml`.
8. Confirm production is indexable while the workers.dev preview remains blocked.

See `docs/HANDOFF.md` for the detailed launch checklist.
