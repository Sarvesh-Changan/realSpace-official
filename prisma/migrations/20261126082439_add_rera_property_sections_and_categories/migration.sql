-- CreateEnum
CREATE TYPE "ReraSectionType" AS ENUM ('INFO_CARDS', 'PHASE_CARDS', 'UNIT_TYPES', 'TEXT_BLOCK');

-- AlterTable
ALTER TABLE "ArnavMedia" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "estimatedBudget" INTEGER;

-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN     "thumbnailPublicId" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "ReraProperty" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "tagline" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "ownerPortraitPublicId" TEXT,
ADD COLUMN     "ownerPortraitUrl" TEXT,
ADD COLUMN     "showOwnerPortrait" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "videoPublicIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "HomeGalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "altText" TEXT,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE INDEX "HomeGalleryImage_isPublished_sortOrder_idx" ON "HomeGalleryImage"("isPublished", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ReraPropertyCategory_name_key" ON "ReraPropertyCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReraPropertyCategory_slug_key" ON "ReraPropertyCategory"("slug");

-- CreateIndex
CREATE INDEX "ReraPropertySection_propertyId_sortOrder_idx" ON "ReraPropertySection"("propertyId", "sortOrder");

-- CreateIndex
CREATE INDEX "ReraProperty_categoryId_idx" ON "ReraProperty"("categoryId");

-- AddForeignKey
ALTER TABLE "ReraProperty" ADD CONSTRAINT "ReraProperty_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ReraPropertyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReraPropertySection" ADD CONSTRAINT "ReraPropertySection_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ReraProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
