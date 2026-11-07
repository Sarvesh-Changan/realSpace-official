# RERA_ARCHITECTURE.md — How the `/rera` Sub-Site Is Built

Extends `ARCHITECTURE.md`. Same stack: Next.js App Router, TypeScript, Tailwind, Framer Motion, Prisma 7 (`@prisma/adapter-pg`), Neon, Cloudinary, NextAuth, Gmail SMTP (nodemailer), Vercel.

## 1. Principles

1. **Additive only.** New routes, components, models and admin modules. No edits to existing interior-site pages, models or logic, except the minimum shared touch-points listed in section 8.
2. **Isolated layout.** The RERA site has its own header/footer/shell. It must not inherit the REALSPACE navbar, footer or WhatsApp button.
3. **Separate data.** RERA content, gallery and enquiries live in their own tables (`Rera*`). Nothing is shared with `SiteSettings`, `Lead` or `GalleryImage`.
4. **Same auth.** One `AdminUser` login. RERA admin routes sit under the existing `/admin` layout and its server-side session guard.

## 2. Route map

```
app/
  (public)/...                 # existing interior site — untouched
  rera/
    layout.tsx                 # RERA shell: header, footer, floating buttons; loads ReraSettings
    page.tsx                   # Home
    about/page.tsx
    gallery/page.tsx
    contact/page.tsx
    actions.ts                 # submitReraEnquiry Server Action
    _components/               # page-level subcomponents (colocated)
  admin/
    layout.tsx                 # existing guard + sidebar + inactivity tracker
    rera/
      settings/ properties/ services/ configurations/
      builders/ gallery/ enquiries/
components/
  rera/layout/                 # ReraHeader, ReraFooter, ReraTopBar, ReraFloatingActions
  rera/ui/                     # small shared pieces if needed
```

`app/rera` is a **sibling** of `app/(public)`, not inside it. A route group's layout applies to everything inside the group, so placing RERA inside `(public)` would force the REALSPACE navbar/footer onto it. Static segments take priority over dynamic ones, so `/rera` will not be captured by any root-level dynamic route such as `[locality]` — verify in the audit step anyway.

## 3. Layout and data loading

- `app/rera/layout.tsx` is a Server Component. It fetches the `ReraSettings` singleton once and passes plain props to `ReraHeader`, `ReraFooter`, `ReraFloatingActions` (client components only where interactivity is needed, e.g. mobile menu, active link via `usePathname`).
- Pages are Server Components that query Prisma directly. Client components receive serialisable props only.
- Freshness: admin Server Actions call `revalidatePath("/rera", "layout")` after every mutation so public pages reflect changes immediately. Pages may also set a short `revalidate` as a safety net.
- Guard against hydration mismatches: no `Date`/random/`window` use during initial render; nullable Prisma values (`Boolean?`, `String?`) use explicit `??` fallbacks on both server and client.

## 3a. Visual system

- Tailwind tokens already defined (`brand.red`, `brand.yellow`, `brand.bg`, `brand.bgAlt`, `brand.text`). No hex literals in components.
- Fonts come from the root layout's `next/font` setup. Do not add Google Fonts `<link>` tags (the CSP blocks them and they are unnecessary).
- Animations: reuse existing Framer Motion patterns/hooks (`usePrefersReducedMotion`, ScrollReveal-style components) rather than creating parallel ones.

## 4. Enquiry flow

1. Client form → `submitReraEnquiry` (Server Action in `app/rera/actions.ts`).
2. Validate with Zod (name 2–80 chars; phone digits/+ only 8–15; email optional/valid; message ≤ 1000 chars; `interestedIn` enum; honeypot field must be empty).
3. Per-IP rate limit using the existing rate-limit helper (same pattern as quote/contact actions).
4. Create `ReraEnquiry` row (optionally linked to a `ReraProperty` when `property` slug matches).
5. Send admin notification via a new `sendReraEnquiryNotification` in `lib/email.ts` (Gmail SMTP). Recipient: `ReraSettings.email`, falling back to `SiteSettings.email`. Wrap in try/catch: an email failure must never lose the enquiry or fail the submission.
6. Return `{ success: true }` or a generic error. No OTP in this phase.

## 5. Admin architecture

- All RERA admin pages live under `app/admin/rera/**`, inheriting `app/admin/layout.tsx` (server-side `auth()` check, sidebar, topbar, inactivity auto-logout).
- Each Server Action independently re-checks `auth()` (do not rely on the layout alone).
- `components/admin/AdminSidebar.tsx` is restructured into two labelled groups: **Interior Design** (existing items, routes unchanged) and **RERA Realty** (new items, `/admin/rera/...`). Dashboard link stays on top. Active-state matching uses route prefixes.
- Reuse existing admin module patterns (table + form + actions) from Services/Gallery/Offers instead of inventing new ones; same Zod + react-hook-form conventions.
- Admin module UIs are written directly in the integration tool by copying those existing patterns (not via AI Studio), to avoid context mismatches.

## 6. Media

- Reuse the signed upload route `app/api/cloudinary/sign/route.ts`; extend the allowed folder list with `rera-properties`, `rera-gallery`, `rera-general`. Keep the same 100 MB video limit, visible error handling (`onError` + inline banner) and pre-upload size check used elsewhere.
- Store both `url` and `publicId` for every asset; delete the old asset when replaced or removed.
- Public rendering via `next/image` (Cloudinary host already allowed). Videos render with `<video controls>` using a thumbnail/poster — never as an `<img>`.
- CSP: `res.cloudinary.com` already allowed for `img-src`/`media-src`; do not loosen the CSP for this feature.

## 7. SEO

- `generateMetadata` per page, content from `ReraSettings` (title pattern: "<Broker name> | Property Dealer in Thane").
- Add `/rera`, `/rera/about`, `/rera/gallery`, `/rera/contact` to `app/sitemap.ts`. `robots.ts` keeps `/admin` disallowed.
- JSON-LD `RealEstateAgent` on `/rera` with name, phone, address and, when set, the RERA registration number.
- Canonical URLs use the production domain.

## 8. Shared touch-points (the only edits outside new files)

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `Rera*` models/enums (see `RERA_DATABASE.md`) — additive migration |
| `prisma/seed.ts` | Idempotently seed one `ReraSettings` row and three `ReraService` rows (Buy/Sell/Rent) |
| `components/admin/AdminSidebar.tsx` | Group items; add RERA group |
| `app/admin/page.tsx` (optional) | Add a "New RERA enquiries" stat card |
| `app/api/cloudinary/sign/route.ts` | Allow new folders |
| `lib/email.ts` | Add `sendReraEnquiryNotification` |
| `app/sitemap.ts` | Add RERA URLs |
| `proxy.ts` (only if needed) | Confirm `/rera/**` is public and `/admin/rera/**` remains protected |

## 9. Prisma 7 / Neon operational notes

- Use `npx prisma migrate dev --name add_rera_module` locally (never `db push`). Commit the migration folder.
- After any schema change: `npx prisma generate`, then **fully stop and restart** `npm run dev` (a stale dev process keeps the old client in memory).
- `lib/prisma.ts` is the only PrismaClient instance; use `prisma.$transaction(..., { timeout, maxWait })` for multi-row writes (Neon cold starts).
- Production: migrations are additive and applied by `prisma migrate deploy` (Vercel build command or manually against the production `DIRECT_URL`).

## 10. Git and release

- Branch `feature/rera-site` from a clean `main`; safety tag `pre-rera-site` first.
- One step = one commit = `npm run build` passing.
- Review on a Vercel **preview deployment** of the branch (confirm preview env vars point to a safe database before testing writes) and get Vijay's approval before merging to `main`.
- Rollback: `git revert` the merge commit (schema additions are additive and harmless if left in place), or redeploy the `pre-rera-site` tag.
