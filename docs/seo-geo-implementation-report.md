# SEO / GEO implementation report — usaeventpartner.com

## Search positioning

The homepage is built around the broad commercial category:

- US event production
- US event support for international brands
- event production partner USA
- local event production United States
- event staffing / merchandise / print / logistics support

The dedicated trade-show page narrows into higher-intent exhibitor searches:

- US trade show support
- trade show support for international exhibitors
- booth production USA
- local trade show staffing / graphics / AV / logistics

The site deliberately avoids fabricated office locations and bulk city doorway pages.

## On-page implementation

- one H1 per indexable page
- concise unique title and meta description
- canonical URLs
- semantic service headings
- internal anchor navigation
- focused FAQ content based on real buyer questions
- descriptive image alt text
- explicit US areaServed structured data
- crawlable text rather than text baked into images
- sitemap with only production pages
- workers.dev previews blocked at Worker level

## Structured data

Each production page includes a JSON-LD graph with:

- Organization
- WebSite
- WebPage
- Service
- FAQPage

No fake LocalBusiness address, review score or event partnership is declared.

## GEO / AI-search signals

The copy answers concrete operational questions rather than only presenting brand slogans. Important concepts are explicit in text:

- what the company can coordinate
- who the service is for
- where it operates
- modular vs turnkey scope
- local production vs international shipping
- venue / hotel delivery caveats
- drayage / official-contractor coordination
- emergency-support limits

This gives search engines and answer systems enough factual context to summarize the offer without inferring unsupported details.

## Performance / image strategy

- WebP derivatives are generated from supplied project photography
- the production build serves the optimized full-size assets directly
- hero image is preloaded and marked `fetchpriority=high`
- below-fold imagery uses lazy loading
- the optimized New York hero also supplies the social preview
- long-term immutable cache headers apply to `/assets/*`

## Measurement plan

Primary conversion: successful lead form submit.

Secondary signals:

- hero / header CTA clicks
- service CTA clicks
- US Event Concierge CTA
- emergency-support CTA
- project gallery view
- direct email / Telegram clicks

Recommended Search Console review after 2–4 weeks of indexing:

1. queries generating first impressions
2. trade-show vs broad event-production intent
3. pages with impressions but weak CTR
4. country distribution of organic traffic
5. whether the trade-show page earns distinct query clusters

Use that evidence to decide the next service page rather than expanding the site by keyword volume alone.
