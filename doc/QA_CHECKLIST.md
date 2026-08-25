# Manual QA Checklist — REALSPACE Website Rebuild

**Version:** 1.0  
**Based on:** `PRD.md` (Product Requirements) and `CODING_STANDARDS.md` (§8 Testing & Verification Discipline)

---

## 1. Responsive Breakpoints Testing Matrix

Test all public and admin pages across the five responsive breakpoint tiers specified in `PRD.md §5`. Ensure no horizontal overflow, text truncation, overlapping elements, or awkward wrapping occurs.

- [ ] **Mobile** (`375px - 430px`): Single-column layouts, touch targets $\ge$ 44px, hamburger off-canvas admin menu, readable text without zoom.
- [ ] **Tablet** (`768px - 834px`): 2-column card grids, flexible tables with horizontal scroll wrappers, touch-friendly controls.
- [ ] **Laptop** (`1024px - 1280px`): Multi-column desktop grids, visible admin sidebar, full navigation bar.
- [ ] **Desktop** (`1440px`): Standard max-w container alignment (`max-w-7xl`), rich visual hierarchy, hover states active.
- [ ] **Large Desktop / TV** (`1920px+`): Container centring, crisp image resolution, no background bleeding or stretched elements.

---

## 2. Public Pages Verification

### 2.1. Home Page (`/`)
- [ ] **Hero Section**: 
  - [ ] Two-column text + 3D scene layout reflows cleanly (stacks vertically on mobile).
  - [ ] 3D canvas lazy-loads without blocking text rendering or page hydration.
  - [ ] Primary CTA ("View Our Work") links to `/projects` and secondary CTA ("Get Free Quote") links to `/quote`.
- [ ] **Trust Stats Bar**: Displays experience, projects count, and ratings cleanly across all breakpoints.
- [ ] **Positioning Band**: Renders studio philosophy and key highlights.
- [ ] **Active Offers Carousel/Grid**: Displays current active promotional offers; hides expired offers.
- [ ] **Featured Projects Grid**: Shows top featured interior and exterior projects with cover images and category tags.
- [ ] **Services Overview**: Displays interior & exterior service categories with matching icons.
- [ ] **Gallery Teaser**: Grid/masonry preview of featured gallery images.
- [ ] **Testimonials Section**: Carousel or grid of client reviews with star ratings.
- [ ] **Final CTA Band**: Displays main call-to-action leading to `/quote` or `/contact`.

### 2.2. Projects Listing Page (`/projects`)
- [ ] **Filter Bar**:
  - [ ] Filter controls (Interior/Exterior toggle, Residential/Commercial toggle, category dropdown) reflow cleanly without cut-off options on mobile.
  - [ ] Selecting filters updates project grid instantly without page reload.
- [ ] **Project Cards Grid**:
  - [ ] Stacks to 1 column on mobile, 2 columns on tablet, 3 columns on desktop.
  - [ ] Cover image renders with proper aspect ratio (fallback placeholder shown if no image).
  - [ ] Card metadata (title, category badge, location) is visible and readable.

### 2.3. Project Detail Page (`/projects/[slug]`)
- [ ] **Image Gallery**: Primary cover image + thumbnail strip/lightbox functions smoothly on touch and desktop.
- [ ] **Header & Badges**: Project title, location, category, design type, and completion year displayed cleanly.
- [ ] **Description & Specs**: Full text formatted properly; carpet area, services tags, and property type displayed.
- [ ] **Related Projects**: Grid of related projects in the same category/design type.
- [ ] **Sticky CTA Sidebar**: Remains accessible on desktop scroll and stacks gracefully on mobile.

### 2.4. Services Pages
- [ ] **Services Overview (`/services`)**: Intro header, kunku/halad blob decoration, and service cards for both Interior and Exterior.
- [ ] **Interior Services (`/services/interior`)**: Grid of interior design services (Modular Kitchen, Living Room, Bedroom, Wardrobe, Turnkey, etc.).
- [ ] **Exterior Services (`/services/exterior`)**: Grid of exterior design services (Architectural Facades, 3D Elevation, Balcony/Terrace, Villas).

### 2.5. About Page (`/about`)
- [ ] **Hero & Philosophy**: Studio intro and design approach.
- [ ] **Trust Indicators**: Verified stats display.
- [ ] **Meet Founder Section**: Headshot of founder Vijay Chawan with bio.
- [ ] **6-Step Process Timeline**: Stacks to a vertical timeline on mobile and reflows on tablet/desktop.
- [ ] **Certifications Section**: Displays verified quality certification badges.

### 2.6. Contact Page (`/contact`)
- [ ] **Info Grid**: Studio address, phone, WhatsApp link, and email displayed with icons.
- [ ] **Contact Form Submission**:
  - [ ] Server-side Zod validation rejects empty/invalid inputs.
  - [ ] Honeypot field silently discards bot submissions.
  - [ ] IP rate limiting blocks >5 submissions within 15 minutes.
  - [ ] Successful submission creates a `Lead` record (`source: CONTACT_FORM`, `status: NEW`).

### 2.7. FAQ Page (`/faq`)
- [ ] Accordion items expand/collapse smoothly.
- [ ] Question titles and answer body texts are legible with proper spacing.

### 2.8. Gallery Page (`/gallery`)
- [ ] Category filter pills scroll horizontally on mobile.
- [ ] Single-column card grid on mobile, multi-column on desktop.
- [ ] Lightbox/Modal displays full-size image/video correctly on mobile and desktop viewports.

### 2.9. Locality Landing Pages (`/[locality]`)
- [ ] Pre-configured locality routes (`/majiwada`, `/ghodbunder-road`, `/kolshet-road`, `/hiranandani-estate`) render shared home blocks.
- [ ] Locality-specific headline and subhead override default home hero copy.
- [ ] Invalid locality slug returns standard `404 Not Found`.

---

## 3. Quote Calculator 4-Step Flow (`/quote`)

Per `CODING_STANDARDS.md §8`, walk through the complete quote calculator flow end-to-end:

### 3.1. Step Indicator
- [ ] Step header ("BHK TYPE — ROOMS TO DESIGN — PACKAGE — GET QUOTE") condenses cleanly on mobile (step counter/progress bar) and expands on desktop.

### 3.2. Step 1: BHK Type
- [ ] Selectable BHK options (1 BHK, 2 BHK, 3 BHK, 4 BHK+, Commercial & Others) display with clear touch targets.
- [ ] Selecting a BHK option loads specific room defaults dynamically from `PricingOption` & `BhkRoomDefault`.

### 3.3. Step 2: Rooms to Design
- [ ] Quantity steppers (+ / -) work for Kitchen, Living Room/Hall, Bedroom, Bathroom, Wardrobe.
- [ ] Quantity bounds (min/max) enforced per BHK defaults.
- [ ] "Fixed Floor" rooms cannot be reduced below minimum required count.

### 3.4. Step 3: Package Tier & Requirements
- [ ] Interior vs. Exterior service requirement toggles operate correctly.
- [ ] Package tier selection (Essential, Premium, Luxury) updates selection state.
- [ ] Additional addon services (e.g. False Ceiling, Lighting, Vastu consultation) selectable.

### 3.5. Step 4: Contact & Verification
- [ ] User fills in Name, Phone, Email, Location, and Requirements.
- [ ] Bot honeypot field (`websiteUrl`) present and invisible to users.
- [ ] Email OTP Verification:
  - [ ] Requesting OTP sends 6-digit OTP code.
  - [ ] Entering correct OTP verifies email and returns a valid `verifiedToken`.
  - [ ] Submitting without verified OTP returns explicit error.
- [ ] **Final Submission & Database Verification**:
  - [ ] Server Action calculates estimated budget range (low/high) based **only** on database `PricingOption` rules.
  - [ ] Single atomic transaction creates `Lead` record (`source: QUOTE_CALCULATOR`, `status: NEW`) and marks OTP token as used.
  - [ ] Summary screen displays estimated budget range and breakdown.

---

## 4. Admin Dashboard & CRUD Modules (`/admin`)

Per `CODING_STANDARDS.md §8`, verify authentication security, layout responsiveness, and full CRUD operations.

### 4.1. Authentication & Session Security
- [ ] **Unauthenticated Access Guard**: Visiting `/admin` or any `/admin/**` sub-route while unauthenticated immediately redirects to `/admin/login`.
- [ ] **Direct Action Security**: Calling any admin Server Action directly without a valid session cookie returns `{ success: false, error: "Unauthorized" }`.
- [ ] **Login Form**:
  - [ ] Valid credentials log in and set secure `httpOnly` `SameSite=Lax` session cookie with 7-day expiry.
  - [ ] Invalid credentials show clear error message ("Invalid email or password").
  - [ ] Login endpoint rate-limits after 5 failed attempts in 15 minutes per IP.
- [ ] **Logout**: Logout action destroys session and redirects to `/admin/login`.

### 4.2. Admin Layout & Off-Canvas Navigation
- [ ] Desktop ($\ge$ 1024px): Sidebar fixed on left.
- [ ] Mobile/Tablet (< 1024px): Hamburger topbar button triggers off-canvas slide-in menu with backdrop. Navigating to any link auto-closes the drawer.

### 4.3. Projects Module (`/admin/projects`)
- [ ] **Table View**: Horizontal scroll container allows smooth table viewing on mobile.
- [ ] **Create Project (`/admin/projects/new`)**:
  - [ ] Title, slug, design type, property type, category, location, description fields functional.
  - [ ] Direct Cloudinary file upload generates signed signature via `/api/cloudinary/sign`.
  - [ ] Non-empty `altText` required on all uploaded images (Zod validation enforced).
- [ ] **Edit Project (`/admin/projects/[id]/edit`)**: Updates existing fields and images cleanly.
- [ ] **Delete & Toggle**: Delete project and toggle published/featured status.

### 4.4. Services Module (`/admin/services`)
- [ ] **List & Table**: Displays all interior and exterior services.
- [ ] **Create/Edit Form**: Inputs for title, slug, design type, description, iconKey, sortOrder, isPublished.
- [ ] **Publish Toggle & Delete**: Instant status toggle and deletion.

### 4.5. Testimonials Module (`/admin/testimonials`)
- [ ] **List & Table**: Displays client reviews, ratings, and published states.
- [ ] **Create/Edit Form**: Client name, role/locality, quote, project type, 1-5 star rating selector.
- [ ] **Publish Toggle & Delete**: Functional.

### 4.6. FAQs Module (`/admin/faqs`)
- [ ] **List & Table**: Displays questions, answers, and sort order.
- [ ] **Modal / Form**: Inputs for question text, answer text, sort order, published state.
- [ ] **Publish Toggle & Delete**: Functional.

### 4.7. Pricing Rules Module (`/admin/pricing`)
- [ ] **Calculator Rules Table**: Displays base prices and per-unit prices grouped by `bhk_type`, `kitchen`, `hall`, `bedroom`, `bathroom`, `wardrobe`, `material_tier`, `exterior_service`, and `addon`.
- [ ] **Option CRUD**: Create, edit, and deactivate pricing options.
- [ ] **BHK Defaults Editor**: Configure default room quantities (min/max/fixed floor) per BHK type.

### 4.8. Leads Module (`/admin/leads`)
- [ ] **Lead Table**: Filter by status (`NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`) and source (`QUOTE_CALCULATOR`, `CONTACT_FORM`).
- [ ] **Lead Detail Modal**: View lead details, selections snapshot, budget estimate, and update internal admin notes & status.

### 4.9. Site Settings Module (`/admin/settings`)
- [ ] Form for company name, phone, WhatsApp, email, studio address, hero headline, hero subhead, CTA text, and social links (Instagram, Facebook, YouTube).
- [ ] Saving updates site settings and revalidates public page caches.

### 4.10. Certifications Module (`/admin/certifications`)
- [ ] **List & Form**: Title, badge label, issuing body, image URL, sort order, published state CRUD.

### 4.11. Offers Module (`/admin/offers`)
- [ ] **List & Form**: Offer title, description, image URL, CTA label, CTA link, start date, end date, active state CRUD.

### 4.12. Gallery Module (`/admin/gallery`)
- [ ] **Categories Tab**: Create and edit gallery categories.
- [ ] **Images Tab**: Upload image/video directly to Cloudinary, assign category, design type, theme, budget label, description, and featured/published status.

---

## 5. SEO, Security & Performance Verification

- [ ] **Metadata API**: Every public page exports non-empty `generateMetadata()` with title, description, and OpenGraph parameters.
- [ ] **Sitemap**: `/sitemap.xml` renders static paths and dynamic project URLs correctly.
- [ ] **Robots**: `/robots.txt` allows public crawlers, disallows `/admin/` and `/api/`, and points to `/sitemap.xml`.
- [ ] **JSON-LD Schema**: `<script type="application/ld+json">` with `LocalBusiness` data present in public layout HTML.
- [ ] **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Content-Security-Policy` header present on HTTP responses.
- [ ] **No PII Leaks**: Lead PII payload never rendered on any public page or exposed in public client bundles.
- [ ] **Build Verification**: `npm run build` completes with **0 TypeScript or Next.js errors**.
