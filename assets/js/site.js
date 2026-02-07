// Contact form handler (single, correct submit flow)
(() => {
  const API_URL = "https://7ofigcp921.execute-api.us-east-1.amazonaws.com/contact";

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  const button = form.querySelector("button[type='submit']");

  function setNote(msg, ok = true) {
    note.textContent = msg;
    note.style.color = ok ? "#2e7d32" : "#b00020";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Read values BEFORE doing anything else
    const payload = {
      name: (form.elements.namedItem("name")?.value || "").trim(),
      email: (form.elements.namedItem("email")?.value || "").trim(),
      company: (form.elements.namedItem("company")?.value || "").trim(),
      message: (form.elements.namedItem("message")?.value || "").trim(),
      website: (form.elements.namedItem("website")?.value || "").trim(), // honeypot (ok if missing)
    };

    // basic front-end validation (matches your Lambda expectations)
    if (!payload.name) return setNote("Please add your name so we know how to address you.", false);
    if (!payload.email) return setNote("Please add your email so we can reply.", false);
    if (!payload.message) return setNote("Please add a message.", false);

    setNote("");
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      console.log("API status:", res.status, "body:", data);

      if (res.ok && data.ok) {
        form.reset(); // reset ONLY after success
        setNote("Thanks! Your message has been sent.");
      } else {
        setNote(`Error: ${data.error || "Request failed"}`, false);
      }
    } catch (err) {
      console.error("Network error:", err);
      setNote("Network error. Please try again.", false);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Send message";
      }
    }
  });
})();
