const form = document.querySelector("#contact-form");
const note = document.querySelector("#form-note");

if (form && note) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements["name"].value.trim();

    if (!name) {
      note.textContent = "Please add your name so we know how to address you.";
      return;
    }

    note.textContent = "Thanks, we have received your request.";
    form.reset();
  });
}

// === Contact form handler ===
// === Contact form handler ===
(() => {
  const API_URL = "https://7ofigcp921.execute-api.us-east-1.amazonaws.com/contact"; // <-- replace if different

  const form = document.getElementById("contact-form");
  if (!form) return;

  const note = document.getElementById("form-note");
  const button = form.querySelector("button[type='submit']");

  function setNote(msg, ok = true) {
    note.textContent = msg;
    note.style.color = ok ? "#2e7d32" : "#b00020";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setNote("");
    button.disabled = true;
    button.textContent = "Sending…";

    // Use FormData to avoid form.name / form.email collisions
    const fd = new FormData(form);

    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      company: (fd.get("company") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
      website: (fd.get("website") || "").toString().trim() // honeypot (optional)
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.reset();
        setNote("Thanks! Your message has been sent.");
      } else {
        console.error("API error:", res.status, data);
        // This will show Lambda's exact validation error like "Invalid email"
        setNote(`Error: ${data.error || "Request failed"}`, false);
      }
    } catch (err) {
      console.error("Network error:", err);
      setNote("Network error. Please try again.", false);
    } finally {
      button.disabled = false;
      button.textContent = "Send message";
    }
  });
})();
