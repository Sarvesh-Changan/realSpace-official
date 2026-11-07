# RERA_PRD.md — REALSPACE RERA Realty Sub-Site

Companion to the existing `PRD.md`. Where this file is silent, the existing PRD/ARCHITECTURE/SECURITY/CODING_STANDARDS rules apply unchanged.

## 1. Purpose

Vijay Chawan (owner of REALSPACE) is now a RERA-registered real estate broker. He needs a property-broker website, structurally similar to arnavproperties.com (Thane property dealer), living **inside the existing realspace27.com project** under the `/rera` path:

| URL | Page |
|---|---|
| `/rera` | Home |
| `/rera/about` | About |
| `/rera/gallery` | Gallery |
| `/rera/contact` | Contact |

The interior-design site (`/`, `/projects`, `/gallery`, etc.) must remain **completely unchanged**. The two sites share one codebase, one database, one deployment and one admin login, but have separate content, separate admin sections and separate enquiries.

## 2. Goals

1. Present Vijay as a trustworthy, RERA-registered broker in Thane/Mumbai.
2. Show featured properties, services (Buy / Sell / Rent), popular configurations and builder partners.
3. Generate enquiries (contact form, callback request, property enquiry) stored in the database and emailed to Vijay.
4. Let Vijay manage all RERA content from the existing admin panel, in a separate "RERA" section.

## 3. Non-goals (this phase)

- Property detail pages and a full searchable listings page (`/rera/properties`). Home shows featured properties; each has an "Enquire" button linking to `/rera/contact?property=<slug>`. A listings page is a possible Phase 2 — do not build it unless confirmed.
- User accounts, saved properties, payments, EMI calculators, blog.
- Email OTP verification on RERA forms (honeypot + rate limiting only).
- Changing anything in the interior-design site's routes, components, models or admin modules.
- Linking from the REALSPACE navbar to `/rera` (add later only if the client asks).

## 4. RERA compliance requirements

Confirm exact wording and placement rules with Vijay / MahaRERA guidelines before launch. Working assumptions:

- The broker's **RERA registration number** is displayed in the header strip and the footer of every `/rera` page, as "MahaRERA Registered Broker — Reg. No. <number>". If the number is not yet entered in admin, **nothing is shown** — never show a placeholder or fake number on the public site.
- Each property listing shows its **project RERA number** when one is set. In admin, publishing a property without a project RERA number shows a warning (not a hard block, because some listings such as resale may not have one).
- The About page has a "Our RERA Registration" card: registered name, registration number, and a "Verify on MahaRERA" link (URL stored in admin).
- Never copy another broker's registration number, text or photos (including from arnavproperties.com).

## 5. Pages and sections

### 5.1 Home (`/rera`)
1. Hero: full-width image, headline, subline, "View Properties" (scrolls to featured section) and "Request Callback" (→ `/rera/contact`).
2. Quick-enquiry strip (Buy / Rent / Sell tabs, locality, budget). Implemented as a plain GET form to `/rera/contact?interest=&locality=&budget=` — no JS required.
3. Welcome blurb with 3 stats (years of experience, happy families, properties closed).
4. Services: Buy, Sell, Rent (admin-managed cards).
5. Popular Configurations: e.g. 1/2/3 BHK "starting from" cards (admin-managed).
6. Featured Properties: up to 6 published + featured properties.
7. Builder Partners logo strip (admin-managed; hidden if none).
8. Closing CTA band.

### 5.2 About (`/rera/about`)
Page banner, founder portrait + story, RERA registration card, values (4 items), stats, areas served chips, closing CTA. Content comes from RERA settings (admin-editable).

### 5.3 Gallery (`/rera/gallery`)
Category chips (All, Residential, Commercial, Ongoing Projects, Handovers), uniform responsive grid, lightbox supporting images and video, URL query sync (`?category=`).

### 5.4 Contact (`/rera/contact`)
Enquiry form (name, phone, email optional, interested in Buy/Sell/Rent/Other, budget, locality, message), callback strip, address/phones/email/hours, WhatsApp link. Prefills from query params (`interest`, `budget`, `locality`, `property`). On success: confirmation message, enquiry stored, email sent to Vijay.

### 5.5 Shared shell
Header (logo, nav, "Request Callback" button, thin top bar with phone/email and RERA badge), footer (description, quick links, contact, socials, RERA line, copyright), floating WhatsApp button, floating call button on mobile.

## 6. Admin requirements (same login, new "RERA" section)

Sidebar is split into two labelled groups: **Interior Design** (all existing modules, unchanged routes) and **RERA Realty** (new). Dashboard stays shared.

RERA modules: Settings (business details, RERA number, hero, about content, stats, areas served, socials), Properties (with images), Services, Configurations, Builder Partners, Gallery, Enquiries (status: New / Contacted / Converted / Closed, notes).

All mutations re-check the admin session server-side (per `SECURITY.md`). Images/videos upload via the existing signed Cloudinary route using new folders `rera-properties`, `rera-gallery`, `rera-general`.

## 7. Design direction

- White / off-white background; REALSPACE Kunku Red `#990000` and Halad Yellow `#FECC00` as accents only (same owner and domain). Use existing Tailwind tokens (`brand.red`, `brand.yellow`, `brand.bg`, `brand.bgAlt`, `brand.text`); do not hardcode hex values in components.
- Existing fonts (Josefin Sans headings, Lato body, loaded via `next/font`) — no new font requests.
- Premium, image-led, spacious, trustworthy. Small radii, soft shadows, no dark theme, no glassmorphism, restrained animation (respect `prefers-reduced-motion`).
- Decision to confirm with the client: if he prefers a visibly different brand identity for the broker business, only the token mapping inside the RERA components changes.

## 8. Content needed from the client (blocking for launch)

Broker/firm name and tagline; exact registered name and MahaRERA registration number; verify link; phone(s), WhatsApp, email, address, hours; hero and about photos; founder photo and bio; stats; areas served; builder partner logos (with permission); property details and photos with project RERA numbers; gallery photos; social links.

## 9. Non-functional

Mobile-first and fully responsive (360px to 1920px+). LCP-friendly hero (`next/image` with priority), lazy-loaded images below the fold, no CLS. Local SEO for Thane/Mumbai/Navi Mumbai with `RealEstateAgent`/`LocalBusiness` structured data. Accessibility: semantic HTML, alt text, keyboard-operable lightbox, visible focus states, reduced motion.

## 10. Acceptance criteria

- All four pages render from database content with no hardcoded business data.
- Interior-design site behaves exactly as before (spot-check `/`, `/projects`, `/gallery`, `/quote`, `/admin`).
- RERA number appears on every `/rera` page only when set.
- Enquiries are stored and emailed; honeypot and rate limiting work.
- Admin sidebar shows two groups; every RERA admin action rejects unauthenticated requests.
- `npm run build` passes; Lighthouse mobile performance on `/rera` is not materially worse than the interior home page.
