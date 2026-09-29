const dataLayer = (window.dataLayer = window.dataLayer || []);
const measurementId = document.querySelector('meta[name="ga4-measurement-id"]')?.content?.trim() || "";

if (measurementId) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  window.gtag = function gtag(){ dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });
}

const track = (event, params = {}) => {
  const safe = { ...params };
  dataLayer.push({ event, ...safe });
  if (measurementId && window.gtag) window.gtag("event", event, safe);
};

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
  track(target.dataset.event, { label: target.dataset.eventLabel || target.textContent.trim().slice(0, 80) });
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
  if (startedAt) startedAt.value = String(Date.now());
  let formStarted = false;
  form.addEventListener("focusin", () => {
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
      status.textContent = "Thanks — your brief is on its way. We’ll come back with the next practical step.";
      status.classList.add("is-success");
      form.reset();
      if (startedAt) startedAt.value = String(Date.now());
    } catch (error) {
      status.textContent = "We couldn’t send the brief. Please email order@swaggy.agency directly.";
      status.classList.add("is-error");
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send Your Brief <span aria-hidden="true">↗</span>';
    }
  });
});
