// Contact form handler (single, correct submit flow)
(() => {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const toggle = nav.querySelector(".nav-toggle");
  const panel = nav.querySelector(".nav-panel");
  const backdrop = nav.querySelector(".nav-backdrop");
  const header = document.querySelector(".site-header");
  if (!toggle || !panel || !backdrop || !header) return;

  const mqDesktop = window.matchMedia("(min-width: 900px)");
  let lockedScrollY = 0;

  function setPanelTop() {
    const rect = header.getBoundingClientRect();
    const top = Math.max(0, Math.round(rect.bottom));
    document.documentElement.style.setProperty("--nav-panel-top", `${top}px`);
  }

  function lockScroll() {
    lockedScrollY = window.scrollY || 0;
    document.body.classList.add("nav-open");
    // iOS-friendly scroll lock.
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.classList.remove("nav-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  }

  function isOpen() {
    return nav.classList.contains("is-open");
  }

  function openMenu() {
    setPanelTop();
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    lockScroll();

    const firstLink = panel.querySelector("a");
    if (firstLink) {
      try {
        firstLink.focus({ preventScroll: true });
      } catch (_) {
        firstLink.focus();
      }
    }
  }

  function closeMenu({ focusToggle = true } = {}) {
    if (!isOpen()) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      return;
    }

    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    unlockScroll();
    if (focusToggle) {
      try {
        toggle.focus({ preventScroll: true });
      } catch (_) {
        toggle.focus();
      }
    }
  }

  toggle.addEventListener("click", () => {
    if (isOpen()) closeMenu();
    else openMenu();
  });

  backdrop.addEventListener("click", () => closeMenu());

  panel.addEventListener("click", (e) => {
    const link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;
    closeMenu({ focusToggle: false });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (isOpen()) setPanelTop();
  });

  // Safari < 14 uses addListener/removeListener.
  function onMqChange() {
    if (mqDesktop.matches) closeMenu({ focusToggle: false });
  }
  if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", onMqChange);
  else if (mqDesktop.addListener) mqDesktop.addListener(onMqChange);

  // Ensure initial ARIA state is consistent.
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
})();

const turnstileGuard = (() => {
  const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  let loadPromise = null;

  function load() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error("Turnstile failed to load"));
      document.head.appendChild(script);
    });

    return loadPromise;
  }

  function containerFor(form) {
    return form.querySelector(".turnstile-widget");
  }

  async function renderFor(form) {
    const container = containerFor(form);
    if (!container) throw new Error("Verification widget is missing");

    const turnstile = await load();
    const sitekey = container.dataset.sitekey;
    if (!sitekey || sitekey === "__TURNSTILE_SITE_KEY__") {
      throw new Error("Verification is not configured");
    }

    if (!container.dataset.widgetId) {
      const widgetId = turnstile.render(container, {
        sitekey,
        execution: "execute",
        appearance: "always",
        callback(token) {
          container.dataset.token = token || "";
          if (container.__turnstileResolve) container.__turnstileResolve(token || "");
        },
        "expired-callback"() {
          container.dataset.token = "";
        },
        "error-callback"() {
          container.dataset.token = "";
          if (container.__turnstileReject) {
            container.__turnstileReject(new Error("Verification challenge failed"));
          }
        },
      });
      container.dataset.widgetId = widgetId;
    }

    return { container, turnstile };
  }

  async function tokenFor(form) {
    const { container, turnstile } = await renderFor(form);
    const existingToken = container.dataset.token || "";
    if (existingToken) return existingToken;

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error("Verification challenge timed out"));
      }, 60000);

      container.__turnstileResolve = (token) => {
        window.clearTimeout(timeout);
        resolve(token);
      };
      container.__turnstileReject = (err) => {
        window.clearTimeout(timeout);
        reject(err);
      };

      turnstile.execute(container.dataset.widgetId);
    });
  }

  function prepare(form) {
    const container = containerFor(form);
    if (!container || container.dataset.prepared === "true") return;
    container.dataset.prepared = "true";

    const start = () => {
      renderFor(form).catch((err) => {
        console.error("Verification setup error:", err);
      });
    };

    form.addEventListener("focusin", start, { once: true });
    form.addEventListener("pointerdown", start, { once: true });
  }

  function reset(form) {
    const container = containerFor(form);
    if (!container) return;
    container.dataset.token = "";
    if (window.turnstile && container.dataset.widgetId) {
      window.turnstile.reset(container.dataset.widgetId);
    }
  }

  return { prepare, tokenFor, reset };
})();

(() => {
  const API_URL = "https://7ofigcp921.execute-api.us-east-1.amazonaws.com/contact";

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  const button = form.querySelector("button[type='submit']");
  turnstileGuard.prepare(form);

  function setNote(msg, ok = true) {
    note.textContent = msg;
    note.style.color = ok ? "#2e7d32" : "#b00020";
  }

  function valueOf(name) {
    const el = form.elements && form.elements.namedItem ? form.elements.namedItem(name) : null;
    // form.elements.namedItem can return an element or RadioNodeList; handle the common element case.
    if (el && typeof el.value === "string") return el.value;
    return "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Read values BEFORE doing anything else
    const payload = {
      name: valueOf("name").trim(),
      email: valueOf("email").trim(),
      company: valueOf("company").trim(),
      message: valueOf("message").trim(),
      website: valueOf("website").trim(), // honeypot (ok if missing)
      turnstile_token: "",
    };

    // basic front-end validation (matches your Lambda expectations)
    if (!payload.name) return setNote("Please add your name so we know how to address you.", false);
    if (!payload.email) return setNote("Please add your email so we can reply.", false);
    if (!payload.message) return setNote("Please add a message.", false);
    setNote("");
    if (button) {
      button.disabled = true;
      button.textContent = "Verifying...";
    }

    try {
      payload.turnstile_token = await turnstileGuard.tokenFor(form);
      if (!payload.turnstile_token) throw new Error("Verification challenge failed");
      if (button) button.textContent = "Sending...";

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      console.log("API status:", res.status, "body:", data);

      if (res.ok && data.ok) {
        form.reset(); // reset ONLY after success
        turnstileGuard.reset(form);
        setNote("Thanks! Your message has been sent.");
      } else {
        turnstileGuard.reset(form);
        setNote(`Error: ${data.error || "Request failed"}`, false);
      }
    } catch (err) {
      console.error("Network error:", err);
      turnstileGuard.reset(form);
      setNote(err.message || "Network error. Please try again.", false);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Send message";
      }
    }
  });
})();

(() => {
  const API_URL = "https://7ofigcp921.execute-api.us-east-1.amazonaws.com/signup";

  const form = document.getElementById("signup-form");
  const note = document.getElementById("signup-note");
  if (!form || !note) return;

  const button = form.querySelector("button[type='submit']");
  turnstileGuard.prepare(form);

  function setNote(msg, ok = true) {
    note.textContent = msg;
    note.style.color = ok ? "#2e7d32" : "#b00020";
  }

  function valueOf(name) {
    const el = form.elements && form.elements.namedItem ? form.elements.namedItem(name) : null;
    if (el && typeof el.value === "string") return el.value;
    return "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      company_name: valueOf("company_name").trim(),
      name: valueOf("name").trim(),
      email: valueOf("email").trim(),
      phone: valueOf("phone").trim(),
      domain: valueOf("domain").trim(),
      website: valueOf("website").trim(), // honeypot (ok if missing)
      turnstile_token: "",
    };

    if (!payload.company_name) return setNote("Please add your company name.", false);
    if (!payload.name) return setNote("Please add your name.", false);
    if (!payload.email) return setNote("Please add your email.", false);
    if (!payload.phone) return setNote("Please add your phone number.", false);
    setNote("");
    if (button) {
      button.disabled = true;
      button.textContent = "Verifying...";
    }

    try {
      payload.turnstile_token = await turnstileGuard.tokenFor(form);
      if (!payload.turnstile_token) throw new Error("Verification challenge failed");
      if (button) button.textContent = "Submitting...";

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      console.log("API status:", res.status, "body:", data);

      if (res.ok && data.ok) {
        form.reset();
        turnstileGuard.reset(form);
        setNote("Thanks! Check your inbox for next steps.");
      } else {
        turnstileGuard.reset(form);
        setNote(`Error: ${data.error || "Request failed"}`, false);
      }
    } catch (err) {
      console.error("Network error:", err);
      turnstileGuard.reset(form);
      setNote(err.message || "Network error. Please try again.", false);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Sign-up for free";
      }
    }
  });
})();
