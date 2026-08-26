-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "showCertificateButton" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "isCategoryCover" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "imagePublicId" TEXT;
