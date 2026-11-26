# RERA Property Pages: Admin-Managed Sections and Categories

Goal: each property's detail page can show rich project content (highlight cards, tower/phase cards with price sheets, unit types with floor plans, text blocks) and every one of those blocks is created and ordered in the admin panel. Nothing is hardcoded on the page. Separately, properties get admin-managed categories (Villa, Farmhouse, Bungalow, and so on), managed in a Categories tab like the gallery admin.

This spec describes **layout structure only**. All text and images come from the admin. Do not read or use anything under `_reference/`.

Attach to every step: `RERA_PROPERTY_SECTIONS.md` (this file), `RERA_DATABASE.md`, `RERA_DATABASE_V2.md`, `RERA_UI_INTEGRATION.md`, `DATABASE.md`, `SECURITY.md`, `CODING_STANDARDS.md`. Standing rules unchanged: clean `git status`, one step per commit with `npm run build` passing, the agent never deletes files, `npx prisma generate` and a full dev-server restart after Prisma changes, and run all local work against a dev database, never production.

## 1. Spec

### 1.1 Page layout (`/rera/properties/[slug]`)
Existing parts stay: page banner with title and breadcrumb, gallery with thumbnails, price card with the Book Site Visit / Enquire form, description, amenities, specifications. New order of the main column:
1. Heading (property title) and optional **tagline** line (for example the configurations summary).
2. Gallery and overview text (existing data).
3. **Sections**, in admin-defined order, each rendered by its type (below).
4. Amenities and specifications (existing data), shown only when present.

If a property has no sections, the page looks as it does today.

### 1.2 Section types
All text is plain text rendered with line breaks (no HTML). Every image carries `{ url, publicId, alt }`, with `url` required to be a `res.cloudinary.com` URL. Limits are enforced on the server.

| Type | Purpose | `data` shape | Limits |
|---|---|---|---|
| `INFO_CARDS` | A row of highlight cards (for example project highlights, amenities, offers, RERA details) | `{ cards: [{ title, lines: string[], body?, image? }] }` | 1–6 cards, title ≤ 80, ≤ 30 lines of ≤ 200 chars, body ≤ 1000 |
| `PHASE_CARDS` | Tower or phase cards, each with a price-sheet or brochure image, a heading and a list of lines | `{ subtitle?, cards: [{ title, subtitle?, lines: string[], image? }] }` | 1–8 cards, subtitle ≤ 120, ≤ 30 lines |
| `UNIT_TYPES` | Configuration rows: floor-plan image(s) beside a details card | `{ units: [{ title, planImages: Asset[], fields: [{ label, value }] }] }` | 1–30 units, ≤ 2 plan images each, ≤ 10 fields (label ≤ 40, value ≤ 120) |
| `TEXT_BLOCK` | A centered or left-aligned heading with body text and an optional button | `{ subtitle?, body, align: "left" \| "center", cta?: { label, href } }` | body ≤ 5000, label ≤ 40, `href` an https URL or a path starting with `/` |

Section-level fields: `title` (the section heading, optional), `sortOrder`, `isPublished`. Maximum 20 sections per property.

### 1.3 Data model

```prisma
model ReraPropertyCategory {
  id          String         @id @default(cuid())
  name        String         @unique
  slug        String         @unique
  sortOrder   Int            @default(0)
  isPublished Boolean        @default(true)
  properties  ReraProperty[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum ReraSectionType {
  INFO_CARDS
  PHASE_CARDS
  UNIT_TYPES
  TEXT_BLOCK
}

model ReraPropertySection {
  id          String          @id @default(cuid())
  property    ReraProperty    @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyId  String
  type        ReraSectionType
  title       String?
  data        Json
  sortOrder   Int             @default(0)
  isPublished Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([propertyId, sortOrder])
}

// ReraProperty additions
tagline     String?
categoryId  String?
category    ReraPropertyCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
sections    ReraPropertySection[]
@@index([categoryId])
```

The existing `propertyType` enum stays untouched for compatibility. Public filters and badges use the category.

### 1.4 Rules
- **Validation:** one set of shared Zod schemas in `lib/rera/property-sections/schemas.ts`, discriminated by `type`, used by both admin Server Actions and the public renderer (invalid stored data is skipped, never crashes the page).
- **Assets:** a helper `lib/rera/property-sections/assets.ts` collects every `publicId` in a section's `data`. On update, assets removed from the data are deleted from Cloudinary; on section delete and property delete, all of them are deleted.
- **Security:** every Server Action re-checks the admin session, validates with Zod, and calls `revalidatePath` for `/rera/properties` and the property's page. No HTML is ever rendered from stored text. Links are limited to https URLs and internal paths.
- **Categories:** unique name and slug (slug auto-generated, editable). A category in use cannot be deleted; the admin must unpublish it or reassign its properties. Unpublished categories are hidden from public filters and badges.
- **Starter categories (idempotent seed):** Apartment, Villa, Bungalow, Farmhouse, Commercial, Plot. The admin can add more. Existing properties with no category are mapped from `propertyType` (APARTMENT to Apartment, VILLA to Villa, COMMERCIAL to Commercial, PLOT to Plot; OTHER stays uncategorised) only where `categoryId` is null.

## 2. Steps

### Step 1: Schema, seed and backfill (agent)
```
Using the schema in RERA_PROPERTY_SECTIONS.md section 1.3, update prisma/schema.prisma: add ReraPropertyCategory, the ReraSectionType enum and ReraPropertySection, and add tagline, categoryId, category and sections plus the categoryId index to ReraProperty. Change nothing else.
1. Run `npx prisma migrate dev --name add_rera_property_sections_and_categories` against my local DEV database only (confirm from the connection hostname that it is not the production project and tell me which host it is). Show the full output and the generated migration.sql, and confirm it contains only CREATE TYPE, CREATE TABLE, CREATE INDEX, ALTER TABLE ... ADD COLUMN on ReraProperty (all nullable) and foreign keys, with no DROP and no change to any non-RERA table. If not, stop and report.
2. Run `npx prisma generate` and npm run build, and fix all errors.
3. Update prisma/seed.ts idempotently (without touching existing seed logic): create the six starter categories listed in section 1.4 if missing (slug from name), then set categoryId on existing ReraProperty rows where categoryId is null using the propertyType mapping in section 1.4. Before applying the backfill, print how many rows would change. Run `npx prisma db seed` on dev and show the output.
4. Do not run any reset or db push. Do not modify any file outside prisma/schema.prisma, the new migration folder and prisma/seed.ts.
```
You: restart `npm run dev`, check Prisma Studio. Commit: `feat: add RERA property sections and categories models`

### Step 2: Categories admin with tabs (agent)
```
In app/admin/rera/properties/, add a two-tab layout "Categories | Properties" following the structure of the existing admin Gallery page (tabs styled like the gallery's Categories | Images tabs). "Properties" is the existing table, unchanged.
1. Categories tab: a list of ReraPropertyCategory rows (name, slug, property count, Published toggle, sortOrder, Edit, Delete) with an inline "Add Category" form (name required 2–40 chars, slug auto-generated and editable with collision checking).
2. Server Actions (each re-checks the admin session, validates with Zod, calls revalidatePath for /rera/properties): create, update, toggle published, delete. Delete is refused with a clear message when any property uses the category.
3. In the property form, add a required Category select listing published categories (new properties default to Apartment if it exists) and an optional Tagline text field (≤ 160 chars). Move the existing Property Type select into a collapsed "Advanced" group, unchanged. The properties table gets a Category column and a category filter.
4. Public side: on /rera/properties add category filter chips ("All" plus published categories that have at least one published property) with ?category=<slug> URL sync validated against real slugs, and show the category name as a badge on listing cards and on the detail page. Keep every existing filter working.
5. Run npm run build and fix all errors. Do not modify any file outside app/admin/rera/properties/, app/rera/properties/ and components/rera/.
```
Commit: `feat: add RERA property categories admin and public filter`

### Step 3: Shared schemas and public section renderers (agent)
```
Implement the public rendering of property sections following RERA_PROPERTY_SECTIONS.md sections 1.1 and 1.2.
1. Create lib/rera/property-sections/schemas.ts with the shared Zod schemas (Asset, the four section data shapes, a discriminated union by type) and exported TypeScript types, with the limits from the spec.
2. Create components/rera/property-sections/ with InfoCardsSection, PhaseCardsSection, UnitTypesSection and TextBlockSection, plus a SectionRenderer that picks the component by type. Match the existing RERA design tokens and the docs/RERA_DESIGN_SPEC.md styling if it exists: INFO_CARDS as a responsive 1/2/3-column card grid with a centered card title and the lines listed beneath, an optional image at the bottom; PHASE_CARDS as a responsive card row with the image on top, centered title and subtitle, then the lines; UNIT_TYPES as rows with the plan image(s) on one side and a details card (title and label/value rows) on the other, stacking on mobile; TEXT_BLOCK as a left- or center-aligned heading, subtitle, body and optional button. Plain text only with whitespace-pre-line; next/image with the alt text; below-the-fold images lazy-loaded; alt required.
3. In app/rera/properties/[slug]/page.tsx, load published sections ordered by sortOrder, validate each section's data with the shared schema (skip any that fail validation, never crash), and render them between the gallery/overview and the amenities/specifications. Show the tagline under the heading when present. If there are no sections the page must look as it does today.
4. Use ?? fallbacks for nullable values and no Date/random/window access during render, to avoid hydration mismatches.
5. Run npm run build and fix all errors. Do not modify any file outside lib/rera/property-sections/, components/rera/property-sections/ and app/rera/properties/[slug]/.
```
Commit: `feat: render admin-defined sections on RERA property pages`

### Step 4: Admin section builder (agent)
```
In the admin property edit form (app/admin/rera/properties/), add a "Page Sections" panel below the Property Gallery, for existing properties (show a "Save the property first" note on the new-property page).
1. The panel lists the property's sections in order, each as a collapsible row showing its type label, title, a Published toggle, move up / move down buttons, Edit and Delete. An "Add section" menu offers the four types: Highlight Cards, Tower / Phase Cards, Unit Types with Floor Plans, Text Block.
2. Each type has an editor built from the shared schemas in lib/rera/property-sections/schemas.ts: repeatable cards or units (add, remove, reorder), a repeatable lines list per card (add, remove, reorder), repeatable label/value fields, and image slots using the existing signed Cloudinary upload (folder rera-properties) with preview, required alt text, replace, remove, visible error banners next to the upload control and a 100 MB pre-upload size check. Enforce the limits in the UI with live counters.
3. Server Actions in app/admin/rera/properties/sections-actions.ts: createSection, updateSection, deleteSection, reorderSections, toggleSectionPublished. Each re-checks the admin session, validates with the shared Zod schema (images must be https res.cloudinary.com URLs with a publicId), enforces the 20-section limit, and calls revalidatePath for /rera/properties and the property's page. Create lib/rera/property-sections/assets.ts that collects every publicId from a section's data; on update delete assets that were removed, on section delete delete all of its assets, and update the existing property delete action so deleting a property also deletes every section asset from Cloudinary. Use prisma.$transaction with explicit timeout and maxWait for multi-row writes such as reorder.
4. Never render or store HTML; trim and length-limit all text.
5. Run npm run build and fix all errors. Do not modify any file outside app/admin/rera/properties/, lib/rera/property-sections/ and the property delete action.
```
Commit: `feat: add RERA property page sections builder in admin`

### Step 5: Checks before showing the client
- Create a test property, add one section of each type with images, reorder, unpublish and delete them, and watch the public page update within seconds.
- Replace and remove images, then confirm in the Cloudinary console that the old assets are gone; delete a property and confirm all its section assets are gone.
- Try invalid input (over-limit text, a non-Cloudinary image URL, a `javascript:` link, an unauthenticated request); all must be rejected.
- Categories: add Farmhouse and Bungalow, assign properties, test the public chips and `?category=`, try deleting a category in use (must be refused).
- Mobile: check every section type at 360px and 430px.
- No text, image, phone number or registration number from any third-party site exists in `app/`, `components/`, `lib/`, `public/`, seed files or the database.
