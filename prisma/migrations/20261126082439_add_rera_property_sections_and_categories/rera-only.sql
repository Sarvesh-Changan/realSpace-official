BEGIN;

CREATE TYPE "ReraSectionType" AS ENUM (
  'INFO_CARDS',
  'PHASE_CARDS',
  'UNIT_TYPES',
  'TEXT_BLOCK'
);

ALTER TABLE "ReraProperty"
  ADD COLUMN "categoryId" TEXT,
  ADD COLUMN "tagline" TEXT;

CREATE TABLE "ReraPropertyCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReraPropertyCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReraPropertySection" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "type" "ReraSectionType" NOT NULL,
  "title" TEXT,
  "data" JSONB NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReraPropertySection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReraPropertyCategory_name_key"
  ON "ReraPropertyCategory"("name");
CREATE UNIQUE INDEX "ReraPropertyCategory_slug_key"
  ON "ReraPropertyCategory"("slug");
CREATE INDEX "ReraPropertySection_propertyId_sortOrder_idx"
  ON "ReraPropertySection"("propertyId", "sortOrder");
CREATE INDEX "ReraProperty_categoryId_idx"
  ON "ReraProperty"("categoryId");

ALTER TABLE "ReraProperty"
  ADD CONSTRAINT "ReraProperty_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ReraPropertyCategory"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReraPropertySection"
  ADD CONSTRAINT "ReraPropertySection_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "ReraProperty"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
