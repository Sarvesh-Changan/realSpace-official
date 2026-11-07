-- Additive only: supports multiple Cloudinary images per testimonial.
ALTER TABLE "Testimonial"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "imagePublicIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
