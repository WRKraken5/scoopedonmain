// Scooped On Main -- shared site behavior.
// No hover animations are added here on purpose: state changes (nav underline,
// button color) are handled instantly in CSS, not animated in JS.

document.addEventListener("DOMContentLoaded", () => {
  wireContactForm();
});

function wireContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(form);

    // Client-side checks are a UX convenience only. The server performs the
    // authoritative validation and sanitization (see contact-handler.js).
    let valid = true;

    const name = form.elements["name"];
    if (!name.value.trim()) {
      showError("name-error", "Please enter your name.");
      valid = false;
    }

    const email = form.elements["email"];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError("email-error", "Please enter a valid email address.");
      valid = false;
    }

    const message = form.elements["message"];
    if (!message.value.trim()) {
      showError("message-error", "Please enter a message.");
      valid = false;
    }

    const consentPrivacy = form.elements["consentPrivacy"];
    if (!consentPrivacy.checked) {
      status.textContent = "You must agree to the Privacy Policy to submit this form.";
      valid = false;
    }

    // Honeypot: if this hidden field has any value, quietly stop (likely a bot).
    const honeypot = form.elements["website"];
    if (honeypot && honeypot.value) {
      status.textContent = "Thank you. We will be in touch.";
      form.reset();
      return;
    }

    if (!valid) return;

    status.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      status.textContent = "Thank you. We will be in touch within two business days.";
      form.reset();
    } catch (err) {
      status.textContent = "Something went wrong sending your message. Please call us instead at (678) 454-2256.";
    }
  });
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
}
