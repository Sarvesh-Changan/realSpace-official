# RERA_DATABASE.md — Database Additions for the RERA Sub-Site

Extends `DATABASE.md`. **Additive migration only.** Do not modify or delete any existing model, enum or row. Existing enums reused: `MediaType` (IMAGE, VIDEO) and `LeadStatus` (NEW, CONTACTED, CONVERTED, CLOSED). Prisma 7 with `@prisma/adapter-pg`; migrations via `prisma migrate dev --name add_rera_module`.

## 1. New enums

```prisma
enum ReraListingType {
  SALE
  RENT
}

enum ReraPropertyType {
  APARTMENT
  VILLA
  COMMERCIAL
  PLOT
  OTHER
}

enum ReraInterest {
  BUY
  SELL
  RENT
  OTHER
}

enum ReraGalleryCategory {
  RESIDENTIAL
  COMMERCIAL
  ONGOING
  HANDOVER
  OTHER
}

enum ReraEnquirySource {
  CONTACT_FORM
  CALLBACK
  PROPERTY_ENQUIRY
}
```

## 2. New models

```prisma
// Singleton row (id = "singleton"), same pattern as SiteSettings
model ReraSettings {
  id                 String   @id @default("singleton")
  brokerName         String   @default("")
  tagline            String?
  reraRegistrationNo String?  // shown publicly ONLY when non-empty
  reraRegisteredName String?
  reraVerifyUrl      String?
  phone              String?
  altPhone           String?
  whatsapp           String?
  email              String?
  address            String?  @db.Text
  officeHours        String?
  socialLinks        Json?    // { instagram, facebook, youtube, linkedin }
  heroHeadline       String   @default("Find Your Dream Home in Thane")
  heroSubhead        String?  @db.Text
  heroImageUrl       String?
  heroImagePublicId  String?
  welcomeTitle       String?
  welcomeBody        String?  @db.Text
  aboutTitle         String?
  aboutBody          String?  @db.Text
  founderName        String?
  founderRole        String?
  founderImageUrl    String?
  founderImagePublicId String?
  yearsExperience    Int?
  happyFamilies      Int?
  propertiesClosed   Int?
  areasServed        String[] @default([])
  updatedAt          DateTime @updatedAt
}

model ReraService {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  iconKey     String?  // maps to a predefined icon set
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// "Popular Configurations" cards, e.g. 2 BHK starting from ...
model ReraConfiguration {
  id                  String   @id @default(cuid())
  label               String   // "2 BHK"
  startingPriceLabel  String   // "Starting from 67 Lakh"
  carpetAreaLabel     String?  // "Carpet 650 sq ft"
  imageUrl            String?
  imagePublicId       String?
  sortOrder           Int      @default(0)
  isPublished         Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model ReraProperty {
  id                  String           @id @default(cuid())
  title               String
  slug                String           @unique
  listingType         ReraListingType  @default(SALE)
  propertyType        ReraPropertyType @default(APARTMENT)
  bhkLabel            String?          // "2 BHK"
  carpetAreaSqFt      Int?
  priceLabel          String           // display text, e.g. "67 Lakh" or "25,000 / month"
  locality            String
  city                String           @default("Thane")
  projectName         String?
  builderName         String?
  projectReraNo       String?          // shown on the card when present
  possession          String?
  description         String?          @db.Text
  coverImageUrl       String?
  coverImagePublicId  String?
  isFeatured          Boolean          @default(false)
  isPublished         Boolean          @default(true)
  sortOrder           Int              @default(0)
  images              ReraPropertyImage[]
  enquiries           ReraEnquiry[]
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  @@index([isPublished, isFeatured])
  @@index([listingType, propertyType])
}

model ReraPropertyImage {
  id          String       @id @default(cuid())
  property    ReraProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyId  String
  url         String
  publicId    String?
  mediaType   MediaType    @default(IMAGE)
  altText     String
  sortOrder   Int          @default(0)
  createdAt   DateTime     @default(now())

  @@index([propertyId])
}

model ReraBuilderPartner {
  id            String   @id @default(cuid())
  name          String
  logoUrl       String
  logoPublicId  String?
  websiteUrl    String?
  sortOrder     Int      @default(0)
  isPublished   Boolean  @default(true)
  createdAt     DateTime @default(now())
}

model ReraGalleryItem {
  id          String              @id @default(cuid())
  title       String
  category    ReraGalleryCategory @default(RESIDENTIAL)
  mediaType   MediaType           @default(IMAGE)
  url         String
  publicId    String?
  thumbnailUrl      String?       // poster for videos
  thumbnailPublicId String?
  fileSizeBytes     Int?
  cloudinaryEtag    String?       // duplicate detection, same idea as GalleryImage
  sortOrder   Int                 @default(0)
  isPublished Boolean             @default(true)
  createdAt   DateTime            @default(now())

  @@index([category, isPublished])
}

model ReraEnquiry {
  id            String            @id @default(cuid())
  name          String
  phone         String
  email         String?
  interestedIn  ReraInterest      @default(BUY)
  budgetLabel   String?
  locality      String?
  message       String?           @db.Text
  source        ReraEnquirySource @default(CONTACT_FORM)
  property      ReraProperty?     @relation(fields: [propertyId], references: [id], onDelete: SetNull)
  propertyId    String?
  status        LeadStatus        @default(NEW)
  notes         String?           @db.Text
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([status])
  @@index([createdAt])
}
```

## 3. Rules and integrity

- **No fake data in production.** Seed only: one `ReraSettings` row (empty RERA number) and three `ReraService` rows (Buy, Sell, Rent). No sample properties, builders or gallery items.
- `ReraSettings.reraRegistrationNo` empty/null means the public site shows no RERA badge anywhere.
- Every image/video row stores both `url` and `publicId` where Cloudinary is used; deleting a row (or replacing the asset) deletes the Cloudinary asset too. Property deletion cascades to `ReraPropertyImage` rows and must delete their Cloudinary assets in the same Server Action.
- `ReraProperty.slug` is auto-generated from the title with collision checks; the admin may edit it.
- Publishing a property with empty `projectReraNo` is allowed but shows an admin warning.
- Enquiry contact data (name, phone, email, message) is personal data: visible only in authenticated admin pages, never passed to public client components, never logged.
- Nullable fields use explicit `??` fallbacks in components to avoid server/client hydration differences.

## 4. Index rationale

`ReraProperty(isPublished, isFeatured)` serves the Home featured query; `ReraGalleryItem(category, isPublished)` serves gallery filtering; `ReraEnquiry(status)` serves the admin enquiries filter.

## 5. Migration checklist

1. Add the enums and models above to `prisma/schema.prisma` (nothing else touched).
2. `npx prisma migrate dev --name add_rera_module`, read the generated SQL (must contain only `CREATE TYPE` / `CREATE TABLE` / `CREATE INDEX` / `ADD FOREIGN KEY`, no `DROP` or `ALTER` on existing tables).
3. `npx prisma generate`, then fully restart the dev server.
4. Confirm in Prisma Studio that all existing tables still hold their data.
