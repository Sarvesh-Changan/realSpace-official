# PRD — REALSPACE Website Rebuild

**Version:** 1.0
**Owner:** Sarvesh Changan
**Client:** REALSPACE Interiors, Thane (Owner: Vijay Chawan)

---

## 1. Background & Problem Statement

REALSPACE is a Thane-based interior + exterior design studio. The current site (realspace27.com) is a static, template-driven page stuffed with repetitive local-SEO copy ("interior designer in Thane" repeated dozens of times), no real portfolio system, no lead database, and no way for the owner to update content without a developer.

The rebuild replaces this with a dynamic, admin-managed Next.js application that:
- Actually showcases completed work (currently the single biggest content gap — see brand research report §5, §17).
- Lets the business generate and manage leads instead of just displaying a phone number.
- Separates Interior and Exterior as two first-class service lines (current site is interior-only).
- Gives the non-technical owner (Vijay Chawan) an Admin Dashboard to run the site day-to-day.

## 2. Goals

1. **Showcase projects** — dynamic, filterable portfolio, Interior and Exterior shown distinctly.
2. **Generate leads** — an interactive quote calculator + contact forms feeding a database, not just a phone number.
3. **Establish trust** — years of experience, project count, testimonials, process transparency.
4. **Give the client control** — Admin Dashboard for projects, services, testimonials, FAQs, pricing rules, leads, and site settings, with zero code changes required for routine updates.
5. **Rank locally** — Local SEO for Thane, Mumbai, Navi Mumbai and specific localities (Majiwada, Ghodbunder Road, Kolshet, etc.).

### Non-goals (out of scope for v1)
- Multi-tenant / multi-studio support.
- Payment processing (quote calculator produces estimates + leads, not invoices).
- Native mobile app.
- Google Maps embed (explicitly excluded per client requirement).
- Full CMS/blog engine beyond a simple optional insights section (nice-to-have, not core).

## 3. Users & Personas

| Persona | Description | Needs |
|---|---|---|
| **Prospective client (public)** | Homeowner/business owner in Thane–Mumbai–Navi Mumbai researching interior/exterior designers, mostly on mobile | Fast answers: what they do, proof of work, rough cost, easy contact |
| **Vijay Chawan (Admin)** | Founder/sole proprietor, non-technical | Add/edit/delete projects and images, view and act on leads, edit pricing rules, update site content — all without a developer |
| **Developer/AI agent (maintainer)** | Whoever extends the codebase later (including AI coding tools) | Predictable structure, typed schema, documented conventions (see CODING_STANDARDS.md) |

## 4. Functional Requirements

### 4.1 Public Website

**Home**
- Premium hero (headline + sub-headline + dual CTA: "View Our Work" / "Get Free Quote")
- Clear Interior + Exterior positioning (not interior-only, unlike the old site)
- Selected Interior projects, selected Exterior projects (curated/featured, pulled from DB)
- Services overview
- "Why Choose REALSPACE" differentiators
- Testimonials
- Final CTA band

**Projects / Portfolio**
- Filterable by: Interior / Exterior, Residential / Commercial, Kitchen, Living Room, Bedroom, Full Home, Villa, Office, Building Exterior, Facade/Elevation
- Each project: gallery (images + optional video), category, interior/exterior type, property type, location, description, services provided
- Project detail page per project (deep-linkable, SEO-indexable)

**Services**
- Interior: Complete Home Interiors, Modular Kitchen, Living Room, Bedroom, Wardrobe, Office Interiors, Renovation, Turnkey Interiors
- Exterior: Exterior Architecture, Building Facade, Elevation Design, Balcony/Terrace, Outdoor Spaces, Villa Exteriors, Commercial Exteriors, Exterior Renovation
- Each service: description, related projects (optional cross-link)

**Get Free Quote (interactive calculator)**
- Step flow (see attached UI reference): BHK Type → Rooms to Design → Package → Get Quote
- Inputs: property type/BHK, kitchens, halls/living rooms, bedrooms, bathrooms, wardrobes, interior requirements, exterior requirements, material/package tier, additional services
- Output: estimated price range, cost breakdown by selected item, summary of selections, "Get Detailed Quote" CTA
- Captures Name, Phone, Email, Location, Requirements → stored as a Lead with `estimatedBudget`
- **All pricing is database-driven via the Admin Dashboard — never hard-coded in frontend components.**
- Mandatory disclaimer: figures are an approximate estimate; final pricing depends on design, measurements, materials, and site requirements.

**About**
- Company story (space-first design philosophy — see brand report §1, a genuine differentiator vs. template-driven chains like Livspace/DesignCafe)
- Founder profile (Vijay Chawan), experience, trust indicators (years, projects completed, rating)

**Contact**
- Phone (click-to-call), WhatsApp (floating button, all viewports), Email, Address, contact form
- No Google Maps embed (explicit client requirement)

**FAQ** — CRUD-managed list, seeded from brand report §13.

### 4.2 Admin Dashboard (authenticated, `/admin`)

| Module | Capabilities |
|---|---|
| Projects | Create/Read/Update/Delete; set Interior/Exterior, project type, location, description, multiple Cloudinary images/videos, "Featured" flag |
| Testimonials | CRUD |
| FAQs | CRUD |
| Quote Calculator Config | Configure BHK pricing, kitchen/hall/bedroom/wardrobe pricing, interior packages, exterior services, material/package tiers, additional services — all versioned and effective-dated |
| Leads | View enquiries and quote requests, customer info, estimated budget, status (`New / Contacted / Converted / Closed`) |
| Site Settings | Company details, phone, WhatsApp, email, social links, hero content, CTA copy |

Admin authentication is required for every route under `/admin` and every mutating API (see SECURITY.md).

## 5. Non-Functional Requirements

- **Responsive**: mobile, tablet, laptop, desktop, large desktop/TV. Mobile-first — brand report §18 notes 70%+ of Thane enquiries are mobile.
- **Performance**: fast Core Web Vitals, lazy-loaded/optimized Cloudinary images, minimal JS on the critical path.
- **SEO**: Next.js metadata API, Open Graph, sitemap.xml, robots.txt, local SEO (Thane/Mumbai/Navi Mumbai + locality landing pages such as `/interior-designer-majiwada`), semantic HTML, LocalBusiness schema markup.
- **Accessibility**: sufficient contrast against the white/light theme, keyboard-navigable forms, alt text fields required on all project images (enforced at the CMS-input level).
- **Reliability**: pricing and content changes must never require a redeploy.
- **Maintainability**: scalable but not over-engineered — a solo-owner business, not an enterprise platform.

## 6. Visual/Brand Requirements (product-level, not just style)

- Predominantly white/very light neutral background; REALSPACE red and yellow as accent-only (CTAs, highlights, icons, hover states, badges) — never a dominant background color.
- No dark-theme-as-primary anywhere on the public site.
- This intentionally supersedes the brand research report's "dark charcoal + gold" recommendation (§6, §18), which was written before the client's own logo colors (red/yellow) were confirmed as the required brand direction — logo-derived accents take priority.

## 7. Success Metrics

- Lead form + quote calculator submissions captured in DB (target: replace phone-only contact as primary conversion path)
- Time-to-update content: owner can publish a new project without developer involvement
- Local search visibility for target keywords (brand report §16: "interior designer in thane", "interior designer majiwada thane", etc.)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1 on mobile

## 8. Known Content Gaps (blocking, per brand research report §17)

The following must be collected from the client before full launch — the PRD assumes these will arrive, and the Admin Dashboard is the mechanism for the client to fill them in without developer help:
- Logo (SVG + PNG)
- Minimum 20 high-res project photos with per-project metadata
- Founder headshot
- Year founded, verified project count
- Confirmed service list and pricing approach (ranges vs. "contact for quote")
- Minimum 8 client testimonials

Until real photos arrive, the Projects module must support placeholder/interim images without breaking layout.

## 9. Open Decisions

- **Neon vs. Supabase** — resolved in ARCHITECTURE.md (recommendation: Neon, given the Prisma + Vercel-first stack already specified).
- Pricing display strategy (ranges vs. "Contact for Quote") — default to showing a computed range from the calculator, since that's an explicit product requirement; final copy pending client confirmation.
