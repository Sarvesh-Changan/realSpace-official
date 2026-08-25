ALTER TABLE "Testimonial"
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "videoPublicId" TEXT,
ADD COLUMN "thumbnailUrl" TEXT,
ADD COLUMN "thumbnailPublicId" TEXT,
ADD COLUMN "slug" TEXT,
ADD COLUMN "location" TEXT;

CREATE UNIQUE INDEX "Testimonial_slug_key" ON "Testimonial"("slug");
