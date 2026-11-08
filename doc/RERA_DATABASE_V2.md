# RERA_DATABASE_V2.md — Schema Addendum for the AI Studio RERA UI

Extends `RERA_DATABASE.md` (migration `add_rera_module` is already applied). This is a **second additive migration** named `add_rera_ui_extensions`. Do not modify or delete any existing model, enum value, column or row.

## 1. Changes to existing models

```prisma
// ReraProperty — add
priceAmount      Int?                  // rupees, used only for sorting and budget filters; priceLabel stays the display text
builtUpAreaSqFt  Int?
furnishing       String?               // e.g. "Semi-furnished"
amenities        String[] @default([])
specifications   Json?                 // [{ "label": "Flooring", "value": "Vitrified" }, ...]
isNewLaunch      Boolean  @default(false)   // builder project launches (replaces the standalone projects.ts)

// ReraService — add
highlights       String[] @default([])

// enum ReraEnquirySource — add values
POST_PROPERTY
SITE_VISIT

// ReraEnquiry — add
details          Json?                 // form-specific fields: post-property type/BHK/area/expected price, preferred visit slot, etc.
```

## 2. New models

```prisma
model ReraTestimonial {
  id          String   @id @default(cuid())
  authorName  String
  authorRole  String?
  society     String?
  quote       String   @db.Text
  rating      Int      @default(5)
  isPublished Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
}

model ReraFaq {
  id          String   @id @default(cuid())
  question    String
  answer      String   @db.Text
  isPublished Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Only populated with branches the client confirms are real
model ReraBranch {
  id          String   @id @default(cuid())
  name        String
  address     String   @db.Text
  phone       String?
  mapUrl      String?
  isPublished Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
}
```

Add `@@index([isNewLaunch, isPublished])` on `ReraProperty`.

## 3. Rules

- No fake data in production: seed nothing into the new tables.
- `priceAmount` and `priceLabel` must agree; admin shows both and warns if `priceAmount` is empty (the property then sorts last and is excluded from budget filters).
- Testimonials: only real client reviews the client has permission to publish.
- Unused tables from the first migration (`ReraConfiguration`, `ReraBuilderPartner`) stay in place, unused, unless the final UI shows them. Do not drop them.
- Nullable fields use `??` fallbacks in components (hydration safety, as elsewhere in this project).

## 4. Migration checklist

1. Edit only `prisma/schema.prisma` as above.
2. `npx prisma migrate dev --name add_rera_ui_extensions`; read the SQL. It may contain only `ALTER TYPE ... ADD VALUE`, `ALTER TABLE ... ADD COLUMN` (nullable or with defaults, on the new `Rera*` tables only), `CREATE TABLE`, `CREATE INDEX`. Any `DROP`, any change to a non-RERA table, or any `NOT NULL` column without a default means stop and report.
3. `npx prisma generate`, fully restart `npm run dev`.
4. Check Prisma Studio: all earlier tables and rows intact.
