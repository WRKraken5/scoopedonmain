# Scooped On Main, LLC — Website

A static, security-conscious marketing site for Scooped On Main, an ice cream and sweet shop in Ball Ground, Georgia. Built to deploy as-is on Vercel, Netlify, or any static host.

## What's here

- `index.html` — homepage: hero, featured flavors, categorized menu, real Google reviews, location/hours with an embedded map.
- `contact.html` — inquiry form with explicit privacy consent checkbox, honeypot, and CSRF token placeholder.
- `privacy.html`, `terms.html`, `cookies.html`, `refunds.html` — the four required legal pages.
- `404.html` — styled, accessible error page with a return-home action.
- `styles.css` — the full design system (color tokens, type scale, components).
- `main.js` — contact form client-side UX/validation (not the security boundary).
- `cookie-consent.js` — consent banner; currently a no-op loader since the default setup (cookieless analytics) doesn't require it.
- `scroll-reveal.js` — small IntersectionObserver fade-in, disabled under `prefers-reduced-motion`.
- `contact-handler.js`, `security-headers.js` — Node/Express reference implementations of the server-side security checklist below. If you deploy as a static site with a serverless function instead, port the same logic (schema validation, sanitization, CSRF, honeypot, rate limiting) into that function.
- `vercel.json` — security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy) for static hosting.
- `.env.example`, `.gitignore`, `image-licenses.csv` — operational hygiene files.
- `robots.txt`, `sitemap.xml` — basic SEO plumbing.

## Before launch — required

1. **Domain.** Every canonical URL and `og:url` in this codebase uses the placeholder `https://scoopedonmainllc.com`. Replace it site-wide with the real domain once one is registered.
2. **Hours.** Real business hours were not provided, so the Location section says to call ahead or check Google. Replace the placeholder text in `index.html` (`#location`) with actual hours as soon as they're confirmed, and keep them in sync with the Google Business Profile.
3. **Photography.** No real photos were supplied, so the site ships without a hero/menu image gallery rather than fabricated stock imagery. Add real, licensed photos of the storefront, scoops, and treats, write descriptive alt text for each, and log the source/license in `image-licenses.csv` (a stub `og-image.jpg` row is already there).
4. **Contact form backend.** `contact.html` posts to `/api/contact`. Stand up that endpoint (serverless function or the included Express reference) with real CSRF issuance, environment-based secrets, and a transactional email provider. Never let this go live posting to a placeholder.
5. **Legal review.** The four legal pages are complete, plain-language drafts, not attorney-reviewed contracts. Have a Georgia-licensed attorney review them, especially the refund and terms pages, before publishing.
6. **Favicons.** `images/favicon.svg` is a simple original ice-cream mark. Generate PNG fallbacks (`favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`) from it if you need broader legacy-browser icon support.

## Security checklist already covered

- CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, and Permissions-Policy headers (`vercel.json` / `security-headers.js`).
- Server-side input validation (Zod schema) and HTML sanitization on every form field before storage or email forwarding.
- Honeypot field plus CSRF token plumbing on the contact form.
- Rate limiting on the `/api/contact` route (5 requests / 15 minutes).
- No secrets in source; `.env` is gitignored and `.env.example` documents required variables without values.
- Explicit, separate opt-in checkboxes for contact vs. marketing consent.

## Accessibility

- Skip-to-content link, visible `:focus-visible` rings on every interactive element, and no removed outlines.
- All form fields use explicit `<label>` elements plus `aria-describedby` error regions.
- Reduced-motion users get all content immediately visible with no animation.
- Color palette (warm charcoal `#1A1816` background, cream `#FDFBF7` text, amber `#D97706`/`#F2994A` accents) is chosen to clear WCAG AA contrast; verify with a contrast checker if you adjust it.
