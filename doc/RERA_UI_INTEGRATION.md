# RERA_UI_INTEGRATION.md — Porting the AI Studio RERA UI into the Main Project

Attach this file to every integration prompt, together with `RERA_ARCHITECTURE.md` and `CODING_STANDARDS.md`. It overrides `RERA_PRD.md` where they differ (the UI that was actually built is larger than the original 4-page plan).

## 1. What exists

A standalone Next.js 15 App Router project (generated in Google AI Studio) with its own root layout, `globals.css`, `data/*.ts` sample content, `components/*` and routes at the site root: `/`, `/about`, `/services`, `/properties`, `/properties/[slug]`, `/interiors`, `/post-property`, `/contact`. It is staged in the main repo at `_reference/rera-ui-source/` (read-only reference, excluded from TypeScript and git). The main project is the existing REALSPACE site; the RERA site must live under `/rera` inside it.

## 2. Final route map

| Standalone route | Main project route | Notes |
|---|---|---|
| `/` | `/rera` | Home |
| `/about` | `/rera/about` | |
| `/services` | `/rera/services` | |
| `/properties` | `/rera/properties` | listing + filters |
| `/properties/[slug]` | `/rera/properties/[slug]` | detail page (scope added vs original PRD) |
| `/post-property` | `/rera/post-property` | becomes an enquiry form (source POST_PROPERTY) |
| `/contact` | `/rera/contact` | |
| `/interiors` | **removed** | duplicates the REALSPACE interior site; Home keeps a small teaser linking to `/` |
| (none) | `/rera/gallery` | optional; original requirement. Build only if the client still wants it |

All internal links go through one helper, `lib/rera/routes.ts` (`reraPath("/about")` returns `"/rera/about"`). No hardcoded root-relative hrefs in RERA components.

## 3. Porting rules (never break the interior site)

1. **Namespace everything.** Components go to `components/rera/` keeping their file names; types to `types/rera.ts`; hooks to `hooks/rera/`; helpers to `lib/rera/`. Never overwrite an existing file (`lib/utils.ts`, `hooks/use-mobile.ts`, `types/index.ts`, `components/Footer.tsx`, etc. may already exist for the interior site). Reuse the existing `cn()` helper if present.
2. **Layout.** `app/rera/layout.tsx` wraps pages with the ported `AppShell` (TopBar, Footer, floating WhatsApp/call buttons, consultation modal provider). It must not render `<html>` or `<body>`, and must not import the interior navbar/footer.
3. **Fonts.** Playfair Display and Inter are loaded with `next/font/google` inside `app/rera/layout.tsx` and applied through CSS variables on a wrapper element with class `rera-root`. No Google Fonts `<link>` tags (self-hosted at build; CSP unchanged).
4. **CSS scoping.** The standalone `globals.css` content moves to `app/rera/rera.css`, imported only by `app/rera/layout.tsx`. Every global selector (`html`, `body`, `*`, `::selection`, scrollbars, headings, `:root` variables, any Tailwind `@theme` tokens) is scoped under `.rera-root` or renamed with a `rera-` prefix. After porting, the interior home page and admin must look identical to before.
5. **Do not copy** these standalone files: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts` (it sets `output: "standalone"` and remote image hosts), `metadata.json`, `.env*`, `app/layout.tsx`, `app/globals.css`. Dependencies: add only packages that are missing from the main `package.json`, and list them in the commit message.
6. **Images.** Sample data uses stock hotlinks (Unsplash/picsum). During staging only, a temporary `remotePatterns` entry marked `// TEMP-RERA-SAMPLE` may exist in `next.config.ts`; it must be removed before merge. Production images come from Cloudinary via admin.
7. **Indexing.** `/rera` metadata is `robots: { index: false, follow: false }` until the client approves the real content (final step flips this).
8. **Agent never deletes files.** It stops importing unused files and lists them; the developer deletes them manually.

## 4. Data decisions (`data/*.ts` → database)

| Standalone data/feature | Decision | Target |
|---|---|---|
| `company.ts` (company, founder, RERA number, branches) | Dynamic | `ReraSettings` + `ReraBranch` (only real branches) |
| `properties.ts` | Dynamic | `ReraProperty` + `ReraPropertyImage` |
| `projects.ts` (marquee builder projects) | Dynamic | `ReraProperty` with `isNewLaunch = true` |
| `commercial.ts` | Dynamic | `ReraProperty` with `propertyType = COMMERCIAL` |
| `services.ts` | Dynamic | `ReraService` (+ `highlights`) |
| `testimonials.ts` | Dynamic | `ReraTestimonial` (real reviews with permission only) |
| `faq.ts` | Dynamic | `ReraFaq` (answers verified by the client) |
| `navigation.ts` | Static in code | routes, filter option lists; locality options derive from published properties |
| `interiors.ts`, `InteriorCostEstimator`, `BeforeAfterSlider` | **Removed from RERA** | interior pricing is database-driven on the main site; never duplicate or hardcode it |
| `valuation.ts`, `PropertyValuationTool` | **Removed** | market benchmarks are unverified claims; revisit only with real, client-supplied data |
| `EMICalculator` | Keep static | pure client math, add an "indicative only" disclaimer |
| Forms (Contact, Callback, ConsultationModal, PropertyDetailModal visit booking, Post Property) | Wire to DB | all call `submitReraEnquiry` (source/`details` JSON per form) |

## 5. Content and compliance rules

Everything in the AI Studio sample data is placeholder content unless the client confirms it. Before anything is published, the client must confirm or replace: the MahaRERA registration number and registered name (verify against the certificate and the MahaRERA portal), founding year/years of experience, family/home counts, square-footage figures, the "Google rating", every branch address, every builder/project name and its project RERA number, every price, every testimonial (real, with permission), and statements about brokerage fees, stamp duty or timelines. Anything not confirmed is removed, not softened.

- The RERA number shows only when set in admin; never a fallback number.
- A property card shows its project RERA number only when the field is filled.
- Seed no sample properties, projects, testimonials or builders in production.
- Stock photos of other people's properties are never shown as the client's listings.

## 6. Acceptance for the port

- `/` and `/admin` render exactly as before (visual check + `npm run build`).
- Every RERA route renders under `/rera/...` with working internal links and active nav state.
- No `app/rera` file imports from `_reference/` or from the temporary sample-data folder once Phase D finishes.
- No hardcoded business data, prices, ratings or stats remain in RERA components.
