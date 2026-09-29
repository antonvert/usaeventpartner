import assert from "node:assert/strict";
import worker from "../src/_worker.js";

const assets = { fetch: async () => new Response("<html>ok</html>", { headers: { "Content-Type":"text/html" } }) };

const preview = await worker.fetch(new Request("https://usa-event-partner.workers.dev/"), { LOCAL_DEV:"false", ASSETS:assets });
assert.equal(preview.status,200);
assert.equal(preview.headers.get("X-Robots-Tag"),"noindex, nofollow");
assert.equal(preview.headers.get("Cache-Control"),"no-store");

const previewRobots = await worker.fetch(new Request("https://usa-event-partner.workers.dev/robots.txt"), { LOCAL_DEV:"false", ASSETS:assets });
assert.equal(await previewRobots.text(),"User-agent: *\nDisallow: /\n");
assert.equal(previewRobots.headers.get("X-Robots-Tag"),"noindex, nofollow");

const redirect = await worker.fetch(new Request("https://www.usaeventpartner.com/test?x=1"), { LOCAL_DEV:"false", ASSETS:assets });
assert.equal(redirect.status,308);
assert.equal(redirect.headers.get("Location"),"https://usaeventpartner.com/test?x=1");

const crossOrigin = await worker.fetch(new Request("https://usaeventpartner.com/api/lead", {
  method:"POST", headers:{ "Content-Type":"application/json", Origin:"https://example.com" }, body:"{}"
}), { LOCAL_DEV:"false", ASSETS:assets });
assert.equal(crossOrigin.status,403);

let delivered;
const payload = {
  name:"QA Test", email:"qa@example.com", company:"QA Company", event:"New York · QA",
  need:"Synthetic delivery test", page:"homepage", consent:true, startedAt:Date.now()-3000
};
const lead = await worker.fetch(new Request("https://usaeventpartner.com/api/lead", {
  method:"POST", headers:{ "Content-Type":"application/json", Origin:"https://usaeventpartner.com" }, body:JSON.stringify(payload)
}), {
  LOCAL_DEV:"false", ASSETS:assets,
  LEAD_EMAIL:{ send: async (message) => { delivered = message; } }
});
assert.equal(lead.status,200);
assert.deepEqual(await lead.json(),{ ok:true });
assert.equal(delivered.to,"order@swaggy.agency");
assert.equal(delivered.from.email,"leads@usaeventpartner.com");
assert.equal(delivered.replyTo.email,payload.email);
assert.match(delivered.subject,/usaeventpartner\.com lead/);

console.log("Worker tests passed: preview noindex, canonical redirect, origin validation and lead delivery contract.");
