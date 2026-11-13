-- Additive CMS extensions. Legacy Arnav table names are retained via Prisma @@map
-- so any rows created by the earlier implementation remain available.
ALTER TABLE "SiteSettings"
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "logoPublicId" TEXT,
  ADD COLUMN "faviconUrl" TEXT,
  ADD COLUMN "faviconPublicId" TEXT,
  ADD COLUMN "footerContent" TEXT,
  ADD COLUMN "copyrightText" TEXT,
  ADD COLUMN "headerCtaText" TEXT,
  ADD COLUMN "headerCtaUrl" TEXT,
  ADD COLUMN "navigationJson" TEXT;

ALTER TABLE "ArnavPageSection"
  ADD COLUMN "imagePublicId" TEXT,
  ADD COLUMN "mediaAssetId" TEXT;

ALTER TABLE "ArnavPage"
  ADD COLUMN "publishedContentJson" TEXT;

ALTER TABLE "ArnavMedia"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN "format" TEXT,
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER,
  ADD COLUMN "fileSizeBytes" INTEGER,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "ArnavMedia_category_sortOrder_idx" ON "ArnavMedia"("category", "sortOrder");
