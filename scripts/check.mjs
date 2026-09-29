import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (p) => readFile(path.join(root,p),"utf8");
const [home, trade, css, client, worker, wrangler, sitemap, robots] = await Promise.all([
  read("dist/index.html"), read("dist/trade-show-support-us/index.html"), read("dist/assets/styles.css"), read("dist/assets/script.js"),
  read("src/_worker.js"), read("wrangler.jsonc"), read("dist/sitemap.xml"), read("dist/robots.txt")
]);
const failures=[]; const warnings=[];
const count=(s,r)=>(s.match(r)||[]).length;
const socialName="og-usa-event-partner.jpg";
const socialUrl=`https://usaeventpartner.com/assets/images/${socialName}`;

const readJpegFrame=(buffer)=>{
  if(buffer.length<4||buffer[0]!==0xff||buffer[1]!==0xd8)return null;
  let offset=2;
  while(offset<buffer.length){
    while(offset<buffer.length&&buffer[offset]!==0xff)offset++;
    while(offset<buffer.length&&buffer[offset]===0xff)offset++;
    if(offset>=buffer.length)break;
    const marker=buffer[offset++];
    if(marker===0xd9||marker===0xda)break;
    if(marker===0x01||(marker>=0xd0&&marker<=0xd8))continue;
    if(offset+1>=buffer.length)break;
    const len=buffer.readUInt16BE(offset);
    const sof=[0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker);
    if(sof&&len>=8&&offset+len<=buffer.length)return { marker,height:buffer.readUInt16BE(offset+3),width:buffer.readUInt16BE(offset+5),components:buffer[offset+7] };
    if(len<2)break; offset+=len;
  }
  return null;
};

function checkPage({source,name,canonical,faqCount}){
  if(count(source,/<h1\b/g)!==1)failures.push(`${name} must contain exactly one H1.`);
  if(!source.includes(`rel="canonical" href="${canonical}"`))failures.push(`${name} canonical is incorrect.`);
  if(source.includes('name="robots" content="noindex'))failures.push(`${name} must remain indexable.`);
  if(!source.includes('type="application/ld+json"'))failures.push(`${name} structured data is missing.`);
  if(!source.includes('action="/api/lead"'))failures.push(`${name} lead form endpoint is missing.`);
  for(const field of ["name","email","company","need"]) if(!source.includes(`name="${field}"`))failures.push(`${name} missing lead field: ${field}`);
  if(count(source,/class="faq-item"/g)!==faqCount)failures.push(`${name} FAQ count is incorrect.`);
  const title=source.match(/<title>([^<]+)<\/title>/)?.[1]||"";
  const desc=source.match(/<meta name="description" content="([^"]+)">/)?.[1]||"";
  if(title.length<30||title.length>70)failures.push(`${name} title length ${title.length} is outside 30–70.`);
  if(desc.length<110||desc.length>170)failures.push(`${name} description length ${desc.length} is outside 110–170.`);
  const schemaText=source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  try{
    const data=JSON.parse(schemaText||"");
    const types=data?.["@graph"]?.map(x=>x["@type"])||[];
    for(const t of ["Organization","WebSite","WebPage","Service","FAQPage"])if(!types.includes(t))failures.push(`${name} schema missing ${t}.`);
  }catch{ failures.push(`${name} structured data is invalid JSON.`); }
  for(const marker of [
    `property="og:image" content="${socialUrl}"`, `property="og:image:secure_url" content="${socialUrl}"`,
    'property="og:image:width" content="1200"', 'property="og:image:height" content="630"',
    'name="twitter:card" content="summary_large_image"'
  ]) if(!source.includes(marker)) failures.push(`${name} social metadata incomplete: ${marker}`);
}

checkPage({source:home,name:"Homepage",canonical:"https://usaeventpartner.com/",faqCount:7});
checkPage({source:trade,name:"Trade show page",canonical:"https://usaeventpartner.com/trade-show-support-us/",faqCount:4});

for(const phrase of ["You bring the event. We handle the US.","Everything around your US event.","US EVENT CONCIERGE","LAST-MINUTE EVENT SUPPORT"]) if(!home.includes(phrase)) failures.push(`Homepage missing approved positioning: ${phrase}`);
if(count(home,/class="service-card"/g)!==8)failures.push("Homepage must contain eight service cards.");
if(count(home,/class="project-card /g)!==6)failures.push("Homepage must contain six project cards.");
if(count(home,/class="reason-card"/g)!==4)failures.push("Homepage must contain four local-partner reasons.");
if(count(home,/class="process-step"/g)!==5)failures.push("Homepage must contain five process steps.");
if(!home.includes('data-observe-event="project_gallery_view"'))failures.push("Project gallery analytics observer is missing.");
if(!home.includes('fetchpriority="high"')||!home.includes('rel="preload" as="image"'))failures.push("Hero image priority is not configured.");
if(count(home,/loading="lazy"/g)<6)failures.push("Below-fold photography must be lazy loaded.");

for(const event of ["hero_cta_click","header_cta_click","form_start","form_submit","telegram_click","email_click","project_gallery_view","service_cta_click","emergency_cta_click"]) if(!home.includes(event)&&!client.includes(event))failures.push(`Analytics event missing: ${event}`);
const ga=home.match(/<meta name="ga4-measurement-id" content="([^"]*)">/)?.[1]||"";
if(ga&&!/^G-[A-Z0-9]{6,}$/.test(ga))failures.push("GA4 measurement ID has invalid format.");
if(!ga)warnings.push("GA4_MEASUREMENT_ID is not set; production deploy should wait for a dedicated stream unless analytics is intentionally disabled.");
if(process.env.REQUIRE_GA4==="1"&&!ga)failures.push("Production check requires GA4_MEASUREMENT_ID.");

for(const color of ["#10233f","#173e6d","#1c8c86","#dcece8","#f7f5ef","#c84232"]) if(!css.toLowerCase().includes(color))failures.push(`Selected 1+3 palette missing ${color}.`);
if(css.includes("border-radius: 999px"))failures.push("Pill-shaped 999px radii are not allowed in selected design.");

const imageNames=[
"hero-new-york-event-support.webp",
"mercuryo-event-activation-dinner.webp",
"mercuryo-event-kit-table.webp",
"mercuryo-payment-event-materials.webp",
"indomitable-games-apparel.webp",
"incymo-ai-event-giveaway.webp", socialName];
for(const name of imageNames){try{await access(path.join(root,"dist/assets/images",name));}catch{failures.push(`Missing optimized image: ${name}`);}}
try{
  const buf=await readFile(path.join(root,"dist/assets/images",socialName)); const frame=readJpegFrame(buf);
  if(!frame)failures.push("Social preview is not a readable JPEG.");
  else { if(frame.width!==1200||frame.height!==630)failures.push("Social preview must be 1200×630."); if(frame.components!==3)failures.push("Social preview must be RGB JPEG."); }
}catch{failures.push("Social preview cannot be read.");}

if(!sitemap.includes("https://usaeventpartner.com/</loc>")||!sitemap.includes("https://usaeventpartner.com/trade-show-support-us/"))failures.push("Sitemap missing production URL.");
if(sitemap.includes("workers.dev"))failures.push("Sitemap contains preview URL.");
if(!robots.includes("Allow: /")||!robots.includes("https://usaeventpartner.com/sitemap.xml"))failures.push("robots.txt is incorrect.");
if(!wrangler.includes('"name": "usa-event-partner"'))failures.push("Cloudflare Worker name is incorrect.");
if(!wrangler.includes('"pattern": "usaeventpartner.com"')||!wrangler.includes('"pattern": "www.usaeventpartner.com"'))failures.push("Cloudflare custom domains are incomplete.");
if(!wrangler.includes('"destination_address": "order@swaggy.agency"'))failures.push("Lead destination is incorrect.");
if(!worker.includes('requestedHost === "www.usaeventpartner.com"'))failures.push("www canonical redirect missing.");
if(!worker.includes('requestedHost.endsWith(".workers.dev")')||!worker.includes('"X-Robots-Tag","noindex, nofollow"'))failures.push("workers.dev noindex protection missing.");
if(!worker.includes("env.LEAD_EMAIL")||!worker.includes("leads@usaeventpartner.com"))failures.push("Email delivery configuration incomplete.");
if(!worker.includes("sameOrigin(request)"))failures.push("Lead endpoint origin guard missing.");

const all=[home,trade,css,client,worker,wrangler,sitemap,robots].join("\n").toLowerCase();
for(const forbidden of ["corp-merch.eu","https://merch.mt","corporate merchandise produced in the eu","barcelona 2027"]) if(all.includes(forbidden.toLowerCase()))failures.push(`Legacy project content remains: ${forbidden}`);

if(warnings.length)console.warn(warnings.map(x=>`⚠ ${x}`).join("\n"));
if(failures.length){console.error(failures.map(x=>`• ${x}`).join("\n"));process.exit(1);}
console.log("Checks passed: usaeventpartner.com output, 1+3 design, SEO/GEO, lead form, analytics hooks, assets and Cloudflare guards are consistent.");
