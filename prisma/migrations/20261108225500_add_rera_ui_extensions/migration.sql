-- AlterEnum
ALTER TYPE "ReraEnquirySource" ADD VALUE 'POST_PROPERTY';
ALTER TYPE "ReraEnquirySource" ADD VALUE 'SITE_VISIT';

-- AlterTable
ALTER TABLE "ReraService" ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ReraProperty" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "builtUpAreaSqFt" INTEGER,
ADD COLUMN     "furnishing" TEXT,
ADD COLUMN     "isNewLaunch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceAmount" INTEGER,
ADD COLUMN     "specifications" JSONB;

-- AlterTable
ALTER TABLE "ReraEnquiry" ADD COLUMN     "details" JSONB;

-- CreateTable
CREATE TABLE "ReraTestimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "society" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReraTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraBranch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "mapUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReraBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReraProperty_isNewLaunch_isPublished_idx" ON "ReraProperty"("isNewLaunch", "isPublished");

