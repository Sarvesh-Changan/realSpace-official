ALTER TABLE "ReraService"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "shortDescription" TEXT,
  ADD COLUMN "pageHeading" TEXT,
  ADD COLUMN "bannerImageUrl" TEXT,
  ADD COLUMN "bannerImagePublicId" TEXT,
  ADD COLUMN "bannerImageAlt" TEXT,
  ADD COLUMN "contentImages" JSONB,
  ADD COLUMN "sections" JSONB,
  ADD COLUMN "ctaText" TEXT,
  ADD COLUMN "ctaUrl" TEXT;

CREATE UNIQUE INDEX "ReraService_slug_key" ON "ReraService"("slug");
