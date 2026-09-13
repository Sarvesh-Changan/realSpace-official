-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "cloudinaryEtag" TEXT;

-- CreateIndex
CREATE INDEX "GalleryImage_cloudinaryEtag_idx" ON "GalleryImage"("cloudinaryEtag");
