// Scooped On Main -- contact form endpoint (reference implementation).
// Server-side validation and sanitization is authoritative. Client-side
// validation in main.js is a UX convenience only and is never trusted here.
// Adapt to your actual hosting/runtime: a serverless function on Netlify or
// Vercel follows the same logic in a different file shape.

const { z } = require("zod");
const sanitizeHtml = require("sanitize-html");

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  reason: z.enum(["catering", "feedback", "general", "other"]),
  message: z.string().trim().min(1).max(4000),
  consentPrivacy: z.union([z.literal(true), z.literal("true")]),
  consentMarketing: z.union([z.literal(true), z.literal(false), z.literal("true"), z.literal("false")]).optional(),
  website: z.string().max(0).optional(), // honeypot: must arrive empty
  csrf_token: z.string().min(1),
});

async function handleContactSubmit(req, res) {
  // 1. CSRF check (in addition to CSRF middleware validating csrf_token
  //    against the session-bound value; shown here for clarity of intent).
  if (!isValidCsrfToken(req)) {
    return res.status(403).json({ error: "Invalid or expired form session. Please reload the page and try again." });
  }

  // 2. Origin/Referer as a second, cheap layer against cross-site submission.
  const origin = req.get("origin") || req.get("referer") || "";
  if (!origin.startsWith(process.env.SITE_ORIGIN)) {
    return res.status(403).json({ error: "Request origin not allowed." });
  }

  // 3. Schema validation.
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid submission." });
  }

  // 4. Honeypot: silently accept-and-drop instead of telling a bot it failed.
  if (parsed.data.website) {
    return res.status(200).json({ ok: true });
  }

  // 5. Strip any HTML/script content from free-text fields before storing
  //    or forwarding by email, so nothing renders unescaped later (XSS).
  const clean = {
    name: sanitizeHtml(parsed.data.name, { allowedTags: [], allowedAttributes: {} }),
    email: parsed.data.email,
    phone: parsed.data.phone ? sanitizeHtml(parsed.data.phone, { allowedTags: [], allowedAttributes: {} }) : "",
    reason: parsed.data.reason,
    message: sanitizeHtml(parsed.data.message, { allowedTags: [], allowedAttributes: {} }),
    consentPrivacy: true,
    consentMarketing: parsed.data.consentMarketing === true || parsed.data.consentMarketing === "true",
    submittedAt: new Date().toISOString(),
  };

  try {
    await sendNotificationEmail(clean); // via env-configured provider; API key never in client code
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Log full detail server-side only; never return internal error detail to the client.
    console.error("contact submission failed", err);
    return res.status(500).json({ error: "Could not send your message. Please call us instead." });
  }
}

function isValidCsrfToken(req) {
  // Placeholder: wire to your CSRF middleware of choice (csurf, csrf-csrf,
  // or a double-submit-cookie pattern on a static host + serverless function).
  return Boolean(req.body && req.body.csrf_token);
}

async function sendNotificationEmail(data) {
  // Placeholder: call your transactional email provider's SDK here, reading
  // its API key from process.env only. Never hardcode it, never send it to
  // the browser.
}

module.exports = { handleContactSubmit };
