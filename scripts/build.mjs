import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { faqs, gallery, reasons, services, site, steps, tradeShowPage } from "../src/content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const [stylesSource, scriptSource] = await Promise.all([
  readFile(path.join(root, "src/styles.css")),
  readFile(path.join(root, "src/script.js"))
]);
const version = createHash("sha256").update(stylesSource).update(scriptSource).digest("hex").slice(0, 10);

const esc = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const imageUrl = (name, width, format = "webp") => `/assets/images/${name}-${width}.${format}`;
const imageSrcset = (item, format) => item.widths.map((width) => `${imageUrl(item.image, width, format)} ${width}w`).join(", ");
const largestImageUrl = (item, format) => imageUrl(item.image, item.widths.at(-1), format);
const heroSizes = "(max-width: 1100px) calc(100vw - 24px), (max-width: 1512px) 49vw, 725px";
const wideGallerySizes = "(max-width: 560px) calc(100vw - 24px), (max-width: 820px) calc(50vw - 17px), (max-width: 1512px) calc(66vw - 21px), 980px";
const portraitGallerySizes = "(max-width: 560px) calc(100vw - 24px), (max-width: 820px) calc(50vw - 17px), (max-width: 1512px) calc(33vw - 21px), 480px";
const conciergeSizes = "(max-width: 1100px) min(calc(100vw - 24px), 960px), (max-width: 1512px) 56vw, 830px";
const gallerySizes = (item) => item.className === "project-card--wide" ? wideGallerySizes : portraitGallerySizes;
const socialImage = `${site.url}/assets/images/swaggy-agency-corporate-merch-social-2f4d3c04-960.jpg`;
const socialImageAlt = "SWAGGY Agency corporate merchandise roll-up display";

const picture = ({ item, sizes = gallerySizes(item), eager = false, className = "" }) => `
<picture class="${className}">
  <source type="image/webp" srcset="${imageSrcset(item, "webp")}" sizes="${sizes}">
  <img src="${largestImageUrl(item, "jpg")}" srcset="${imageSrcset(item, "jpg")}" sizes="${sizes}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
</picture>`;

const brand = () => `
<a class="brand" href="/" aria-label="USA Event Partner home">
  <span class="brand__mark" aria-hidden="true">US</span>
  <span class="brand__copy"><strong>USA Event Partner</strong><small>Local production by SWAGGY</small></span>
</a>`;

const header = ({ internal = false } = {}) => {
  const rootHref = internal ? "/" : "";
  return `<header class="site-header">
    ${brand()}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu" data-menu-toggle>
      <span></span><span></span><span></span><span class="sr-only">Open menu</span>
    </button>
    <nav class="main-nav" id="main-menu" aria-label="Main navigation" data-menu>
      <a href="${rootHref}#services">Services</a>
      <a href="${rootHref}#work">Work</a>
      <a href="${rootHref}#concierge">Concierge</a>
      <a href="${rootHref}#process">Process</a>
      <a class="button button--small button--navy" href="#brief" data-event="header_cta_click">Send Your Brief</a>
    </nav>
  </header>`;
};

const leadForm = ({ context = "homepage" } = {}) => `<section class="brief-section" id="brief">
  <div class="brief-section__copy">
    <p class="eyebrow eyebrow--light">START A US PROJECT</p>
    <h2>Tell us about the event. We’ll work out the local part.</h2>
    <p>Send the city, dates, deadline and whatever you already know. A rough brief is enough to start.</p>
    <div class="direct-contact">
      <span>Prefer a direct message?</span>
      <a href="${site.telegramUrl}" target="_blank" rel="noopener" data-event="telegram_click" data-event-label="${context}">Telegram · ${site.telegramLabel}</a>
      <a href="mailto:${site.email}" data-event="email_click" data-event-label="${context}">${site.email}</a>
    </div>
  </div>
  <form class="lead-form" action="/api/lead" method="post" data-lead-form novalidate>
    <div class="lead-form__heading"><strong>Send your brief</strong><span>We only need the essentials.</span></div>
    <div class="form-grid">
      <label>Name *<input name="name" type="text" autocomplete="name" required maxlength="80" placeholder="Your name"></label>
      <label>Work email *<input name="email" type="email" autocomplete="email" required maxlength="160" placeholder="you@company.com"></label>
      <label>Company *<input name="company" type="text" autocomplete="organization" required maxlength="100" placeholder="Company name"></label>
      <label>Event / city / date<input name="event" type="text" maxlength="180" placeholder="Las Vegas · CES · Jan 2027"></label>
      <label>What do you need? *<textarea name="need" rows="4" required maxlength="2500" placeholder="Booth, local print, merch, staffing, AV, emergency support…"></textarea></label>
    </div>
    <label class="honeypot" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
    <input type="hidden" name="startedAt" value="" data-started-at>
    <input type="hidden" name="page" value="${esc(context)}">
    <label class="consent"><input type="checkbox" name="consent" required> <span>I agree to the <a href="${site.privacyUrl}" target="_blank" rel="noopener">processing of my personal data</a> for this enquiry.</span></label>
    <button class="button button--navy" type="submit" data-submit-button>Send Your Brief <span aria-hidden="true">↗</span></button>
    <p class="form-status" role="status" aria-live="polite" data-form-status></p>
  </form>
</section>`;

const footer = () => `<footer class="site-footer">
  <div>${brand()}<p>Local US event production, trade show support, merchandise, staffing and logistics for international teams.</p></div>
  <div class="footer-links">
    <a href="${site.poweredByUrl}" target="_blank" rel="noopener">SWAGGY.agency</a>
    <a href="mailto:${site.email}">${site.email}</a>
    <a href="${site.telegramUrl}" target="_blank" rel="noopener">Telegram</a>
    <a href="${site.privacyUrl}" target="_blank" rel="noopener">Privacy</a>
  </div>
  <p class="footer-note">© ${new Date().getFullYear()} USA Event Partner. Event and client names shown in photography belong to their respective owners.</p>
</footer>`;

const faqMarkup = (items) => items.map((item) => `<details class="faq-item"><summary>${esc(item.question)}</summary><p>${esc(item.answer)}</p></details>`).join("");
const serviceMarkup = services.map((item) => `<article class="service-card">
  <span>${item.number}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p>
  <a href="#brief" data-event="service_cta_click" data-event-label="${esc(item.short)}">Discuss This Service ↗</a>
</article>`).join("");
const galleryMarkup = gallery.map((item) => `<figure class="project-card ${item.className}">
  ${picture({ item }).trim()}
  <figcaption><strong>${esc(item.client)}</strong><span>${esc(item.type)}</span></figcaption>
</figure>`).join("");
const reasonsMarkup = reasons.map((item) => `<article class="reason-card"><span></span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></article>`).join("");
const stepsMarkup = steps.map(([number, title, description]) => `<li class="process-step"><span>${number}</span><h3>${esc(title)}</h3><p>${esc(description)}</p></li>`).join("");

function schema({ url, title, description, faqItems, serviceName }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        email: site.email,
        sameAs: [site.poweredByUrl]
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#service` }
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#service`,
        name: serviceName,
        provider: { "@id": `${site.url}/#organization` },
        areaServed: { "@type": "Country", name: "United States" },
        audience: { "@type": "BusinessAudience", audienceType: "International brands, agencies and marketing teams" }
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };
}

function documentShell({ title, description, canonical, body, schemaData, preload }) {
  const preloadTag = preload ? `<link rel="preload" as="image" type="image/webp" href="${largestImageUrl(preload, "webp")}" imagesrcset="${imageSrcset(preload, "webp")}" imagesizes="${heroSizes}">` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#10233f">
  <meta name="ga4-measurement-id" content="${esc(site.gaMeasurementId)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:secure_url" content="${socialImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="960">
  <meta property="og:image:height" content="504">
  <meta property="og:image:alt" content="${socialImageAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${socialImage}">
  <meta name="twitter:image:alt" content="${socialImageAlt}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${preloadTag}
  <link rel="stylesheet" href="/assets/styles.css?v=${version}">
  <script type="application/ld+json">${JSON.stringify(schemaData)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${body}
  <script src="/assets/script.js?v=${version}" defer></script>
</body>
</html>`;
}

const homeSchema = schema({
  url: `${site.url}/`, title: site.title, description: site.description, faqItems: faqs,
  serviceName: "US event production and local event support for international teams"
});

const homepage = documentShell({
  title: site.title,
  description: site.description,
  canonical: `${site.url}/`,
  schemaData: homeSchema,
  preload: gallery[0],
  body: `<div class="site-shell">
    ${header()}
    <main id="main">
      <section class="hero">
        <div class="hero__copy">
          <p class="eyebrow">US EVENT SUPPORT FOR INTERNATIONAL BRANDS & AGENCIES</p>
          <h1>Your local event team in the US.</h1>
          <p class="hero__lead">From trade shows and brand activations to merchandise, print, staffing, AV and logistics, one local team coordinates the work you do not want to manage from abroad. Use us for one task or the whole local production.</p>
          <div class="hero__actions">
            <a class="button button--light" href="#brief" data-event="hero_cta_click">Send Your Brief <span aria-hidden="true">↗</span></a>
            <a class="button button--outline" href="#services">See What We Handle</a>
          </div>
          <ul class="proof-line"><li>Trade shows</li><li>Activations</li><li>Merchandise & print</li><li>Staffing & logistics</li></ul>
        </div>
        <div class="hero__visual">
          ${picture({ item: gallery[0], sizes: heroSizes, eager: true, className: "hero__picture" }).trim()}
          <div class="hero__caption"><span>Selected production work</span><strong>Mercuryo · Event branding · New York</strong></div>
        </div>
      </section>

      <section class="section projects-section" id="work" data-observe-event="project_gallery_view">
        <div class="section-heading">
          <div><p class="eyebrow eyebrow--dark">SELECTED WORK</p><h2>Event production in the real world.</h2></div>
          <p>Branded environments, merchandise, hospitality and conference materials produced for live events and international teams.</p>
        </div>
        <div class="project-grid">${galleryMarkup}</div>
      </section>

      <section class="section services-section" id="services">
        <div class="section-heading">
          <div><p class="eyebrow eyebrow--dark">ONE PARTNER, FLEXIBLE SCOPE</p><h2>Use one service. Or hand over the whole US side.</h2></div>
          <p>We plug into your existing team, agency or event plan and take care of the local pieces you do not want to source and manage yourself.</p>
        </div>
        <div class="service-grid">${serviceMarkup}</div>
      </section>

      <section class="section local-section">
        <div class="section-heading">
          <div><p class="eyebrow eyebrow--dark">WHY WORK LOCALLY</p><h2>Less supplier chasing. More control.</h2></div>
          <p>One US partner replaces a chain of separate local vendors and keeps deadlines, handoffs and responsibilities in one place.</p>
        </div>
        <div class="reason-grid">${reasonsMarkup}</div>
      </section>

      <section class="concierge" id="concierge">
        <div class="concierge__copy">
          <p class="eyebrow eyebrow--dark">US EVENT CONCIERGE</p>
          <h2>A local operator on call while your team is in the US.</h2>
          <p>Already managing the event yourself? Keep one local contact for the problems that are hard to solve from another country or another time zone. Need extra staff, urgent printing, equipment, transport, merchandise or a supplier tomorrow? Start with one message.</p>
          <ul class="concierge__list"><li>Local suppliers</li><li>Urgent printing</li><li>Extra staffing</li><li>Equipment & rentals</li><li>Merchandise</li><li>Transportation coordination</li></ul>
          <a class="button button--navy" href="#brief" data-event="concierge_cta_click">Get Local Support ↗</a>
        </div>
        <div class="concierge__visual">
          ${picture({ item: gallery[1], sizes: conciergeSizes, className: "concierge__picture" }).trim()}
          <div class="concierge__stamp"><strong>Daily · weekly · project-based</strong><span>A flexible local support layer for international marketing, PR and event teams.</span></div>
        </div>
      </section>

      <section class="emergency">
        <div><p class="eyebrow">LAST-MINUTE EVENT SUPPORT</p><h2>Something missing before the event?</h2></div>
        <div class="emergency__copy">
          <p>Send us the city, date and exact problem. We will quickly tell you what can still be printed, produced, staffed, rented or delivered locally.</p>
          <a class="button button--light" href="#brief" data-event="emergency_cta_click">Send an Urgent Brief ↗</a>
          <div class="emergency__examples"><span>Urgent print & signage</span><span>Replacement merchandise</span><span>Local staff & runners</span><span>Equipment & logistics</span></div>
        </div>
      </section>

      <section class="section process-section" id="process">
        <div class="section-heading">
          <div><p class="eyebrow eyebrow--dark">HOW IT WORKS</p><h2>One brief. One local plan. One accountable team.</h2></div>
          <p>From the first brief to breakdown, the local US work stays with one team.</p>
        </div>
        <ol class="process-list">${stepsMarkup}</ol>
      </section>

      <section class="section faq-section">
        <div class="faq-section__heading"><p class="eyebrow eyebrow--dark">PRACTICAL ANSWERS</p><h2>US event support FAQ</h2><p>What international brands, agencies and event teams usually need to know before they start.</p></div>
        <div class="faq-list">${faqMarkup(faqs)}</div>
      </section>

      ${leadForm()}
    </main>
    ${footer()}
    <a class="mobile-sticky-cta" href="#brief" data-event="mobile_sticky_cta_click">Send Your Brief</a>
  </div>`
});

const tradeSchema = schema({
  url: `${site.url}${tradeShowPage.path}`,
  title: tradeShowPage.title,
  description: tradeShowPage.description,
  faqItems: tradeShowPage.faqs,
  serviceName: "US trade show and conference support for international exhibitors"
});

const tradeHtml = documentShell({
  title: tradeShowPage.title,
  description: tradeShowPage.description,
  canonical: `${site.url}${tradeShowPage.path}`,
  schemaData: tradeSchema,
  preload: gallery[0],
  body: `<div class="site-shell">
    ${header({ internal: true })}
    <main id="main">
      <section class="hero vertical-hero">
        <div class="hero__copy">
          <p class="eyebrow">${tradeShowPage.eyebrow}</p>
          <h1>${esc(tradeShowPage.h1)}</h1>
          <p class="hero__lead">${esc(tradeShowPage.lead)}</p>
          <div class="hero__actions"><a class="button button--light" href="#brief" data-event="hero_cta_click">Send Your Booth Brief ↗</a><a class="button button--outline" href="/#work">See Production Work</a></div>
          <ul class="proof-line"><li>Booth production</li><li>Local crews</li><li>Freight coordination</li><li>On-site support</li></ul>
        </div>
        <div class="hero__visual">${picture({ item: gallery[0], sizes: heroSizes, eager: true, className: "hero__picture" }).trim()}<div class="hero__caption"><span>US exhibitor support</span><strong>One local production team</strong></div></div>
      </section>

      <section class="section vertical-intro">
        <div><p class="eyebrow eyebrow--dark">FULL OR MODULAR SUPPORT</p><h2>Keep your booth plan. Add the local US production.</h2></div>
        <div><p>Keep your global agency, creative team and brand standards. We handle the local production, suppliers, crews and venue-facing details in the US.</p><ul class="vertical-list">${tradeShowPage.bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>
      </section>

      <section class="section local-section">
        <div class="section-heading"><div><p class="eyebrow eyebrow--dark">LOCAL PRODUCTION PARTNER</p><h2>Fewer local vendors. One show-floor plan.</h2></div><p>Production, rentals, official-contractor requirements, crew and delivery stay coordinated around the show schedule.</p></div>
        <div class="reason-grid">${reasonsMarkup}</div>
      </section>

      <section class="section projects-section" data-observe-event="project_gallery_view">
        <div class="section-heading"><div><p class="eyebrow eyebrow--dark">SELECTED WORK</p><h2>Event materials ready for the room.</h2></div><p>Branded environments, conference materials, merchandise and event kits from completed production work.</p></div>
        <div class="project-grid">${gallery.slice(0,4).map((item)=>`<figure class="project-card ${item.className}">${picture({item}).trim()}<figcaption><strong>${esc(item.client)}</strong><span>${esc(item.type)}</span></figcaption></figure>`).join("")}</div>
      </section>

      <section class="section faq-section"><div class="faq-section__heading"><p class="eyebrow eyebrow--dark">TRADE SHOW FAQ</p><h2>Before the exhibitor checklist gets long.</h2><p>Start with the show and the booth. We can work out the local operating details from there.</p></div><div class="faq-list">${faqMarkup(tradeShowPage.faqs)}</div></section>
      ${leadForm({ context: "trade-show-support-us" })}
    </main>
    ${footer()}
    <a class="mobile-sticky-cta" href="#brief" data-event="mobile_sticky_cta_click">Send Your Brief</a>
  </div>`
});

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | USA Event Partner</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/assets/styles.css?v=${version}"></head><body class="error-page"><main>${brand()}<p class="error-page__code">404</p><h1>This route is not on the event plan.</h1><p>Go back to the US event production homepage.</p><a class="button button--navy" href="/">Back to homepage</a></main></body></html>`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;
const lastmod = new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site.url}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n  <url><loc>${site.url}${tradeShowPage.path}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.85</priority></url>\n</urlset>`;
const headers = `/*\n  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com; style-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`;

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist,"assets"), { recursive: true });
await mkdir(path.join(dist,"trade-show-support-us"), { recursive: true });
await cp(path.join(root,"src/assets/images"), path.join(dist,"assets/images"), { recursive: true });
await copyFile(path.join(root,"src/styles.css"), path.join(dist,"assets/styles.css"));
await copyFile(path.join(root,"src/script.js"), path.join(dist,"assets/script.js"));
await copyFile(path.join(root,"src/favicon.svg"), path.join(dist,"favicon.svg"));
await Promise.all([
  writeFile(path.join(dist,"index.html"), homepage),
  writeFile(path.join(dist,"trade-show-support-us/index.html"), tradeHtml),
  writeFile(path.join(dist,"404.html"), notFound),
  writeFile(path.join(dist,"robots.txt"), robots),
  writeFile(path.join(dist,"sitemap.xml"), sitemap),
  writeFile(path.join(dist,"_headers"), headers)
]);
console.log(`Built usaeventpartner.com → ${path.relative(root,dist)}`);
