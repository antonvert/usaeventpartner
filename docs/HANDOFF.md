# USA Event Partner — production handoff

## 1. What is ready

- production homepage
- focused `/trade-show-support-us/` landing page
- responsive 1+3 design system
- optimized WebP photography supplied for the project
- WebP social preview using the New York hero image
- canonical tags and social metadata
- Organization / WebSite / WebPage / Service / FAQ structured data
- sitemap and robots
- client-side analytics hooks
- validated lead form
- Cloudflare Worker email delivery
- apex canonicalization (`www` → apex)
- workers.dev noindex guard
- automated build, validation and Worker contract tests
- GitHub Actions production gate

## 2. Cloudflare requirements

The domain is expected to exist in the correct Cloudflare account before deployment.

`wrangler.jsonc` requests two custom domains:

- `usaeventpartner.com`
- `www.usaeventpartner.com`

The GitHub repository needs:

- secret `CLOUDFLARE_API_TOKEN`
- secret `CLOUDFLARE_ACCOUNT_ID`
- variable `GA4_MEASUREMENT_ID`

The API token must be able to deploy Workers and manage the required custom-domain bindings in the target account.

## 3. Lead email delivery

Worker binding: `LEAD_EMAIL`

Destination: `order@swaggy.agency`

Configured sender: `leads@usaeventpartner.com`

Before launch, verify that Cloudflare Email Service / Email Routing authorizes the destination and allows this sender identity. Then send one real form submission from the production domain and confirm:

- message arrives
- subject contains company / event context
- Reply-To points to the submitted email
- no visitor PII appears in analytics

If sender authorization is not yet ready, production form requests return an explicit error and the frontend tells the visitor to email `order@swaggy.agency` directly.

## 4. Analytics

Create a new GA4 stream specifically for `usaeventpartner.com`; do not reuse the merch.mt or corp-merch.eu stream.

Set its Measurement ID as repository variable `GA4_MEASUREMENT_ID`.

Events currently implemented:

- hero CTA
- header CTA
- service CTA
- concierge CTA
- emergency CTA
- mobile sticky CTA
- form start
- successful form submit
- email / Telegram clicks
- project gallery view

If analytics is enabled for EEA/UK visitors, add the appropriate consent implementation before relying on GA4 measurement there.

## 5. Search launch

After production is live:

1. verify `https://usaeventpartner.com/` returns 200 and is indexable
2. verify `https://www.usaeventpartner.com/` returns permanent redirect to apex
3. verify a workers.dev preview returns `X-Robots-Tag: noindex, nofollow`
4. add / verify the domain in Google Search Console
5. submit `https://usaeventpartner.com/sitemap.xml`
6. request indexing for homepage and `/trade-show-support-us/`
7. check canonical selection after first crawl
8. monitor branded + non-branded impressions separately

## 6. Content / commercial checks before traffic

Confirm that the current wording matches the actual operating scope in the US, especially:

- nationwide availability
- drayage / official-contractor coordination
- local staffing categories
- last-minute support claims
- merchandise fulfillment range

The current copy is intentionally phrased as coordination / capability and avoids claiming guaranteed availability in every city or event.

## 7. Next pages only when justified by demand

Do not mass-produce city doorway pages. The next useful landing pages should be created only when there is a real service + search-intent case, for example:

- `/event-production-us/`
- `/event-merchandise-us/`
- `/last-minute-event-support-us/`
- city/event pages tied to active commercial campaigns or recurring events

Each page should carry unique operational detail, proof and FAQ rather than swapping location names.
