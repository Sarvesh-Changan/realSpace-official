# DATABASE.md — REALSPACE Website Rebuild

Database: PostgreSQL (Neon) · ORM: Prisma · IDs: `cuid()` unless noted

## 1. Entity Overview

```
AdminUser
Project ──< ProjectImage
Project >── ProjectCategory (enum-like via fields, see §2.2)
Service
Testimonial
FAQ
Lead
PricingRule 
PricingOption ──< PricingRule (rule belongs to a configurable option group)
SiteSettings (singleton)
```

## 2. Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Enums ----------

enum DesignType {
  INTERIOR
  EXTERIOR
}

enum PropertyType {
  RESIDENTIAL
  COMMERCIAL
}

enum ProjectCategory {
  KITCHEN
  LIVING_ROOM
  BEDROOM
  FULL_HOME
  VILLA
  OFFICE
  BUILDING_EXTERIOR
  FACADE_ELEVATION
  BALCONY_TERRACE
  OUTDOOR_SPACE
  RENOVATION
  OTHER
}

enum LeadSource {
  QUOTE_CALCULATOR
  CONTACT_FORM
  WHATSAPP_CLICK
}

enum LeadStatus {
  NEW
  CONTACTED
  CONVERTED
  CLOSED
}

enum MediaType {
  IMAGE
  VIDEO
}

// ---------- Core content ----------

model Project {
  id            String          @id @default(cuid())
  title         String
  slug          String          @unique
  designType    DesignType
  propertyType  PropertyType
  category      ProjectCategory
  location      String          // locality only, e.g. "Majiwada, Thane"
  description   String          @db.Text
  servicesUsed  String[]        // free-text tags shown on project detail
  carpetAreaSqFt Int?
  completionYear Int?
  isFeatured    Boolean         @default(false)
  isPublished   Boolean         @default(true)
  sortOrder     Int             @default(0)
  images        ProjectImage[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([designType, category])
  @@index([isFeatured, isPublished])
}

model ProjectImage {
  id            String    @id @default(cuid())
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String
  cloudinaryId  String    // public_id for transformations
  url           String
  mediaType     MediaType @default(IMAGE)
  altText       String    // required at input level for accessibility + SEO
  sortOrder     Int       @default(0)
  isCoverImage  Boolean   @default(false)
  createdAt     DateTime  @default(now())

  @@index([projectId])
}

model Service {
  id           String     @id @default(cuid())
  title        String
  slug         String     @unique
  designType   DesignType
  description  String     @db.Text
  iconKey      String?    // maps to a predefined icon set, not free-text SVG
  sortOrder    Int        @default(0)
  isPublished  Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Testimonial {
  id           String   @id @default(cuid())
  clientName   String
  clientRole   String?  // e.g. "Homeowner, Bhandup" — first name + locality only, per privacy norms
  quote        String   @db.Text
  projectType  String?
  rating       Int      @default(5)
  isPublished  Boolean  @default(true)
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())
}

model FAQ {
  id          String   @id @default(cuid())
  question    String
  answer      String   @db.Text
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ---------- Quote calculator (admin-configurable pricing) ----------

// A PricingOption is a selectable item in the calculator
// (e.g. "3 BHK", "Modular Kitchen - Premium", "Extra Bathroom").
model PricingOption {
  id           String   @id @default(cuid())
  groupKey     String   // "bhk_type" | "kitchen" | "hall" | "bedroom" | "wardrobe"
                         // | "interior_package" | "exterior_service" | "material_tier" | "addon"
  label        String   // "3 BHK", "Premium Laminate", etc.
  designType   DesignType?
  basePrice    Decimal  @db.Decimal(10, 2)
  perUnitPrice Decimal? @db.Decimal(10, 2) // for quantity-based items (e.g. per bedroom)
  isActive     Boolean  @default(true)
  sortOrder    Int      @default(0)
  effectiveFrom DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([groupKey, isActive])
}

model Lead {
  id               String     @id @default(cuid())
  name             String
  phone            String
  email            String?
  location         String?
  requirements     String?    @db.Text
  source           LeadSource
  selections       Json?      // snapshot of quote calculator selections at submission time
  estimatedBudgetLow  Int?
  estimatedBudgetHigh Int?
  status           LeadStatus @default(NEW)
  notes            String?    @db.Text  // internal admin notes
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  @@index([status])
  @@index([source])
}

// ---------- Admin & settings ----------

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  lastLoginAt  DateTime?
}

// Singleton row — enforced at the application layer (always id = "singleton")
model SiteSettings {
  id            String   @id @default("singleton")
  companyName   String   @default("REALSPACE")
  phone         String
  whatsapp      String
  email         String
  address       String
  socialLinks   Json?    // { instagram, facebook, youtube }
  heroHeadline  String
  heroSubhead   String
  ctaText       String
  updatedAt     DateTime @updatedAt
}
```

## 3. Key Relationships

- `Project 1—* ProjectImage`, cascade delete: removing a project removes its image records (Cloudinary assets are deleted via a corresponding API call in the same Server Action, not by a DB trigger).
- `Lead.selections` stores a JSON snapshot of exactly what pricing options/quantities the visitor picked, so historical leads remain accurate even after `PricingOption` values change later — this is why the estimate range is also frozen onto the `Lead` row (`estimatedBudgetLow/High`) rather than recomputed on read.
- `PricingOption.groupKey` is how the quote calculator's steps (BHK Type → Rooms to Design → Package) map to configurable data: each step queries options by `groupKey`, so admins can add/remove/reprice options without a schema change.

## 4. Indexing Rationale

- `Project(designType, category)` — supports the portfolio filter UI directly.
- `Project(isFeatured, isPublished)` — supports the Home page's "selected projects" queries.
- `Lead(status)` — Admin leads view defaults to filtering by status.
- `PricingOption(groupKey, isActive)` — the quote calculator only ever queries active options within one group at a time.

## 5. Data Integrity Rules (enforced in application layer, not just DB)

- `ProjectImage.altText` is a required input in the Admin form — not DB-nullable-but-app-optional, because SEO/accessibility depend on it.
- Deleting a `Project` that has `isFeatured: true` should warn the admin if it's the only featured project of its `designType` (keeps Home page from showing an empty section) — application-level check, not a constraint.
- `PricingOption` rows are never hard-deleted once referenced by any `Lead.selections` snapshot in practice this is moot since selections are a JSON snapshot, not a foreign key — so pricing options **can** be safely deleted/deactivated without breaking historical lead records.

## 6. Migrations

- All schema changes go through `prisma migrate dev` locally, committed as migration files, applied via `prisma migrate deploy` in the Vercel build step for production.
- Preview deployments run against an ephemeral Neon branch seeded from prod schema (via the Neon-Vercel integration), so migrations are tested before hitting `main`.
