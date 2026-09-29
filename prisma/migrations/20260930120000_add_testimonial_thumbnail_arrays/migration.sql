-- Additive only: supports individual thumbnails per video in testimonial.
ALTER TABLE "Testimonial"
ADD COLUMN "thumbnailUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "thumbnailPublicIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
