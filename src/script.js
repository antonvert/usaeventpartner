const dataLayer = (window.dataLayer = window.dataLayer || []);
const measurementId = document.querySelector('meta[name="ga4-measurement-id"]')?.content?.trim() || "";
const productionHost = ["usaeventpartner.com", "www.usaeventpartner.com"].includes(window.location.hostname);
const consentKey = "usa_event_partner_analytics_consent_v1";
let analyticsEnabled = false;

window.gtag = window.gtag || function gtag(){ dataLayer.push(arguments); };

const readConsent = () => {
  try { return window.localStorage.getItem(consentKey); } catch { return null; }
};

const writeConsent = (value) => {
  try { window.localStorage.setItem(consentKey, value); } catch { /* Analytics remains optional. */ }
};

const enableAnalytics = () => {
  if (!productionHost || !measurementId || analyticsEnabled) return;
  analyticsEnabled = true;
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });
};

const mountConsent = () => {
  if (!productionHost || !measurementId) return;
  const stored = readConsent();
  if (stored === "granted") { enableAnalytics(); return; }
  if (stored === "denied") return;
  const banner = document.createElement("aside");
  banner.className = "analytics-consent";
  banner.setAttribute("aria-label", "Analytics preferences");
  banner.innerHTML = '<div><strong>Optional analytics</strong><p>Anonymous usage data helps us improve the site. It is never combined with form details.</p></div><div class="analytics-consent__actions"><button type="button" data-analytics-consent="denied">No thanks</button><button type="button" data-analytics-consent="granted">Allow analytics</button></div>';
  banner.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-analytics-consent]")?.dataset.analyticsConsent;
    if (!choice) return;
    writeConsent(choice);
    if (choice === "granted") enableAnalytics();
    banner.remove();
  });
  document.body.append(banner);
};

const track = (event, params = {}) => {
  const safe = { ...params };
  if (analyticsEnabled) window.gtag("event", event, safe);
  else if (!productionHost) dataLayer.push({ event, ...safe });
};

const normalizedEventName = (name) => ({
  telegram_click: "click_messenger",
  email_click: "click_email",
  phone_click: "click_phone",
  booking_click: "click_booking"
}[name] || name);

mountConsent();

const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("is-open", !open);
    document.body.classList.toggle("menu-open", !open);
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-event]");
  if (!target) return;
  const eventName = normalizedEventName(target.dataset.event);
  track(eventName, {
    label: target.dataset.eventLabel || target.textContent.trim().slice(0, 80),
    messenger: eventName === "click_messenger" ? "telegram" : ""
  });
});

const observed = new Set();
const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const eventName = entry.target.dataset.observeEvent;
    if (eventName && !observed.has(eventName)) {
      observed.add(eventName);
      track(eventName);
    }
    observer.unobserve(entry.target);
  });
}, { threshold: 0.22 }) : null;

document.querySelectorAll("[data-observe-event]").forEach((element) => observer?.observe(element));

document.querySelectorAll("[data-lead-form]").forEach((form) => {
  const startedAt = form.querySelector("[data-started-at]");
  const startFormSession = () => {
    if (!startedAt) return;
    const value = String(Date.now());
    startedAt.value = value;
    startedAt.setAttribute("value", value);
  };
  startFormSession();
  window.addEventListener("pageshow", startFormSession);
  let formStarted = false;
  form.addEventListener("focusin", () => {
    if (!startedAt?.value) startFormSession();
    if (!formStarted) {
      formStarted = true;
      track("form_start", { page: form.querySelector('[name="page"]')?.value || "unknown" });
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("[data-submit-button]");
    const status = form.querySelector("[data-form-status]");
    status.textContent = "";
    status.className = "form-status";

    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.textContent = "Sending…";

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) throw new Error(body.message || body.code || "delivery_failed");
      const page = payload.page || "unknown";
      track("form_submit", { page });
      track("generate_lead", { page, lead_source: "contact_form" });
      status.textContent = "Thanks — your brief is on its way. We’ll come back with the next practical step.";
      status.classList.add("is-success");
      form.reset();
      startFormSession();
    } catch (error) {
      status.textContent = "We couldn’t send the brief. Please email order@swaggy.agency directly.";
      status.classList.add("is-error");
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send Your Brief <span aria-hidden="true">↗</span>';
    }
  });
});
