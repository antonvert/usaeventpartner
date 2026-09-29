# Design directions — usaeventpartner.com

## Shared product logic

All three directions use the same commercial structure:

- One US partner for everything around your event
- Trade Show & Conference Support
- Event & Brand Activation Production
- Merchandise & Event Kits
- Event Branding & Print
- Local Staffing & On-site Support
- US Event Concierge
- Full-service US Event Production
- Last-minute / Emergency Event Support
- One brief, one local point of contact, one accountable execution flow

The difference is visual positioning, not the offer.

---

## A. Corporate US

**Positioning feel:** established US event-production partner for international marketing teams.

**Palette**
- Navy #10233F
- Federal blue #173E6D
- Warm white #F7F5EF
- Steel #DCE3EA
- Signal red #C84232

**Typography**
- Helvetica Neue / Arial / system sans
- Large controlled headlines, no decorative display type

**Layout**
- Strong grid
- Thin rules and numbered modules
- Rectangular CTA buttons
- Large photography, edge-to-edge crops
- Minimal rounded corners

**Hero**
- Eyebrow: US EVENT PRODUCTION FOR INTERNATIONAL TEAMS
- H1: **You bring the event. We handle the US.**
- Subcopy explains one local partner across production, booths, merchandise, staffing and logistics
- Primary CTA: Send Your Brief
- Secondary: See What We Handle

**Photo treatment**
- New York / event-space image as hero
- Product tables and branded-event photography as proof
- Slightly cooler image grading, clean captions

**Best for**
- Enterprise marketing teams
- Agencies
- B2B / fintech / crypto / gaming brands
- Paid traffic where credibility must register immediately

---

## B. American Heritage

**Positioning feel:** experienced, dependable local operator; slightly conservative without becoming old-fashioned.

**Palette**
- Deep ink #162126
- Heritage navy #26384A
- Parchment #F3EFE6
- Brass #B48645
- Muted burgundy #7C3A37

**Typography**
- System sans for UI
- Georgia / Charter-style serif for selected large headings only

**Layout**
- More editorial breathing room
- Framed photography
- Small-cap labels
- Section intros feel like a premium service brochure
- Restrained border treatments

**Hero**
- Eyebrow: YOUR LOCAL EVENT TEAM IN THE UNITED STATES
- H1: **One accountable partner on the ground.**
- Primary CTA: Plan Your US Event
- Secondary: Emergency Support

**Photo treatment**
- Warm event photography
- Strong use of hospitality / branded dinner imagery and product-detail photography
- Captions positioned like case-note annotations

**Best for**
- PR teams
- Corporate events
- Receptions and private activations
- Buyers who value service, calmness and operational reliability

---

## C. Network Edition

**Positioning feel:** direct sibling of merch.mt and corp-merch.eu, adapted for a broader US event-production offer.

**Palette**
- Midnight #172033
- Electric teal #1C8C86
- Soft mint #DCECE8
- Warm white #F7F4EE
- Orange accent #F08A45

**Typography**
- Same system-first logic as the existing sites
- Compact eyebrows, oversized sans-serif headlines

**Layout**
- Same proven section rhythm as corp-merch.eu
- Similar service cards, process rows, project grid, FAQ and lead form
- Different color system and different image treatment so it is visibly its own site

**Hero**
- Eyebrow: US EVENT SUPPORT FOR INTERNATIONAL BRANDS
- H1: **One US partner for your entire event.**
- Primary CTA: Start a US Project
- Secondary: Explore Services

**Photo treatment**
- Mixed masonry / project grid
- Strong use of the supplied Mercuryo and event-merch imagery
- More energetic than the other two directions

**Best for**
- Fastest launch
- Clear family resemblance with the existing SWAGGY ecosystem
- SEO landing-page expansion later

---

## Recommendation for production architecture

Use the same pipeline as corp-merch.eu:

- dependency-light static build
- Cloudflare Worker for lead delivery and canonical redirects
- production root + noindex design-review routes
- robots.txt + sitemap.xml
- JSON-LD / FAQ schema
- GA4 hooks with no personal form fields sent to analytics
- responsive image variants
- Cloudflare preview guarded with `X-Robots-Tag: noindex, nofollow`
- final production checklist in `docs/HANDOFF.md`

The commercial content should be consolidated into fewer on-page blocks than the raw brief. The homepage should sell the umbrella promise first, then expose the eight service lines without feeling like eight unrelated businesses.
