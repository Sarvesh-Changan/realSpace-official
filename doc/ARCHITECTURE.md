# ARCHITECTURE.md — REALSPACE Website Rebuild

## 1. Stack Summary

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components by default; Server Actions for mutations |
| Language | TypeScript (strict mode) | No `any`; see CODING_STANDARDS.md |
| Styling | Tailwind CSS | Design tokens for the white/red/yellow brand palette |
| Motion | Framer Motion | Used sparingly — PRD explicitly forbids "excessive animation" |
| ORM | Prisma | Single source of schema truth, shared types |
| Database | PostgreSQL via **Neon** (see §6 for Neon vs. Supabase decision) | Serverless Postgres, branching for preview deploys |
| Media | Cloudinary | Images/videos for projects, optimized delivery, responsive transforms |
| Auth (admin) | Auth.js (NextAuth) credentials or magic-link, single admin role | See SECURITY.md |
| Hosting | Vercel | Matches Next.js, first-class preview deployments |
| Source control | GitHub | Standard PR-based flow even for a solo dev + AI agent workflow |

## 2. High-Level System Diagram (textual)

```
                          ┌─────────────────────────┐
                          │        Visitors          │
                          │  (mobile/desktop browser)│
                          └────────────┬─────────────┘
                                       │ HTTPS
                          ┌────────────▼─────────────┐
                          │        Vercel Edge        │
                          │   Next.js 15 App Router   │
                          │  ┌──────────┬───────────┐ │
                          │  │  Public  │   Admin   │ │
                          │  │  Routes  │  Routes   │ │
                          │  │ (RSC)    │ (protected)│ │
                          │  └────┬─────┴─────┬─────┘ │
                          │       │ Server     │       │
                          │       │ Actions/   │       │
                          │       │ Route      │       │
                          │       │ Handlers   │       │
                          └───────┼────────────┼───────┘
                                  │            │
                     ┌────────────▼───┐   ┌────▼─────────────┐
                     │  Prisma Client  │   │   Cloudinary API  │
                     └────────┬────────┘   │ (upload/transform)│
                              │            └────────────────────┘
                     ┌────────▼────────┐
                     │  Neon PostgreSQL │
                     └──────────────────┘
```

## 3. Route Structure (App Router)

```
app/
  (public)/
    page.tsx                    # Home
    projects/
      page.tsx                  # Portfolio with filters
      [slug]/page.tsx           # Project detail
    services/
      page.tsx
      interior/page.tsx
      exterior/page.tsx
    about/page.tsx
    contact/page.tsx
    quote/page.tsx              # Multi-step quote calculator
    faq/page.tsx
    [locality]/page.tsx         # Local SEO landing pages (majiwada, ghodbunder-road, ...)
  admin/
    layout.tsx                  # Auth guard wraps all admin routes
    page.tsx                    # Dashboard overview
    projects/
    services/
    testimonials/
    faqs/
    pricing/
    leads/
    settings/
    login/page.tsx              # Only unauthenticated admin route
  api/
    quote/route.ts              # Quote submission (public, rate-limited)
    contact/route.ts            # Contact form (public, rate-limited)
    admin/**                    # Admin CRUD endpoints (auth-guarded) OR Server Actions
    cloudinary/sign/route.ts    # Signed upload endpoint (auth-guarded)
```

Mutations (admin CRUD, form submissions) are implemented as **Server Actions** where possible; `api/` route handlers are reserved for cases needing a stable HTTP contract (webhooks, signed uploads, anything called from client-side fetch outside the Next.js request lifecycle).

## 4. Data Flow — Quote Calculator (the core product-critical flow)

1. Visitor completes the step wizard (BHK → Rooms → Package → Contact info).
2. On submit, a Server Action reads **current pricing rules from the database** (never from a frontend constant) and computes the estimate server-side.
3. Estimate + selections + contact details are persisted as a `Lead` (`source: "quote_calculator"`, `status: "New"`).
4. Response renders the estimate range + breakdown back to the visitor with the disclaimer text.
5. Admin sees the new lead in `/admin/leads` immediately (no polling needed for v1 — refresh on navigation is sufficient).

This flow is the reason pricing must be modeled as data (`PricingRule` table, see DATABASE.md), not code — the PRD explicitly forbids hard-coding pricing in frontend components.

## 5. Media Handling

- Admin uploads go client → signed Cloudinary upload (server issues a short-lived signature via `api/cloudinary/sign`) → Cloudinary returns a `public_id`/URL → that URL is what's stored in Postgres via `ProjectImage`.
- The app never proxies raw file bytes through the Next.js server — avoids serverless function payload limits and keeps uploads fast.
- Public-facing images use Cloudinary's `next-cloudinary` component or manually constructed transformation URLs for responsive `srcset`, WebP/AVIF auto-format, and lazy loading.

## 6. Neon vs. Supabase — Decision

**Recommendation: Neon.**

| Factor | Neon | Supabase |
|---|---|---|
| Fit with specified stack (Prisma + Next.js + Vercel) | Purpose-built for this combo; official Vercel-Neon integration | Also works, but ships a lot of unused surface area (built-in auth, storage, realtime) for this project |
| Branching | Native DB branching per PR/preview deploy — genuinely useful here since Admin Dashboard changes are risky to test against prod data | No native equivalent |
| Scope match | This project needs *just* Postgres + Prisma; auth is handled by Auth.js, storage by Cloudinary | Supabase's auth/storage would duplicate Auth.js/Cloudinary, adding complexity without benefit |
| Pricing predictability for a small studio site | Simple compute+storage model | Similarly fine, but bundled features aren't used |

Supabase would be the better call if the client wanted Supabase Auth or Supabase Storage instead of Auth.js/Cloudinary — they don't, so Neon is the leaner choice.

## 7. Environments

| Env | Branch | DB | Purpose |
|---|---|---|---|
| Production | `main` | Neon prod branch | Live site |
| Preview | any PR | Neon ephemeral branch (auto-created per PR via Vercel-Neon integration) | Safe testing of schema/admin changes |
| Local | — | Neon dev branch or local Postgres via Docker | Development |

## 8. SEO & Metadata Architecture

- `generateMetadata()` per route for title/description/OG tags, sourced from `SiteSettings` + per-entity fields (project titles, locality names) rather than hard-coded strings.
- `app/sitemap.ts` and `app/robots.ts` generated dynamically from the Projects and Services tables so new content is auto-included.
- `LocalBusiness` + `Product`/`Service` JSON-LD schema injected per relevant page.
- Locality landing pages (`/[locality]`) are a thin templated layer over shared content blocks with locality-specific copy fields — avoids duplicate-content risk while still hitting brand report §16's keyword targets.

## 9. Deployment & CI

- GitHub → Vercel auto-deploy on push; PR previews get their own Neon branch and Vercel preview URL.
- `npm run build` gate before merge (matches the developer's existing discipline of validating a section before moving to the next — see CODING_STANDARDS.md).
- Environment variables (Cloudinary keys, DB URL, Auth secret) managed in Vercel project settings, never committed.

## 10. Why this architecture avoids over-engineering

- No microservices, no separate backend service — Next.js Server Actions/route handlers are sufficient for a single-studio site.
- No custom CMS — the Admin Dashboard *is* the CMS, scoped exactly to REALSPACE's entities.
- No queueing/background-job infra — lead volume for a single-studio Thane business does not warrant it; synchronous DB writes are enough for v1.
