-- CreateEnum
CREATE TYPE "ReraListingType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "ReraPropertyType" AS ENUM ('APARTMENT', 'VILLA', 'COMMERCIAL', 'PLOT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReraInterest" AS ENUM ('BUY', 'SELL', 'RENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReraGalleryCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'ONGOING', 'HANDOVER', 'OTHER');

-- CreateEnum
CREATE TYPE "ReraEnquirySource" AS ENUM ('CONTACT_FORM', 'CALLBACK', 'PROPERTY_ENQUIRY');

-- CreateTable
CREATE TABLE "ReraSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "brokerName" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT,
    "reraRegistrationNo" TEXT,
    "reraRegisteredName" TEXT,
    "reraVerifyUrl" TEXT,
    "phone" TEXT,
    "altPhone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "officeHours" TEXT,
    "socialLinks" JSONB,
    "heroHeadline" TEXT NOT NULL DEFAULT 'Find Your Dream Home in Thane',
    "heroSubhead" TEXT,
    "heroImageUrl" TEXT,
    "heroImagePublicId" TEXT,
    "welcomeTitle" TEXT,
    "welcomeBody" TEXT,
    "aboutTitle" TEXT,
    "aboutBody" TEXT,
    "founderName" TEXT,
    "founderRole" TEXT,
    "founderImageUrl" TEXT,
    "founderImagePublicId" TEXT,
    "yearsExperience" INTEGER,
    "happyFamilies" INTEGER,
    "propertiesClosed" INTEGER,
    "areasServed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraService" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraConfiguration" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startingPriceLabel" TEXT NOT NULL,
    "carpetAreaLabel" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraProperty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "listingType" "ReraListingType" NOT NULL DEFAULT 'SALE',
    "propertyType" "ReraPropertyType" NOT NULL DEFAULT 'APARTMENT',
    "bhkLabel" TEXT,
    "carpetAreaSqFt" INTEGER,
    "priceLabel" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Thane',
    "projectName" TEXT,
    "builderName" TEXT,
    "projectReraNo" TEXT,
    "possession" TEXT,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "coverImagePublicId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraPropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReraPropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraBuilderPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "logoPublicId" TEXT,
    "websiteUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReraBuilderPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraGalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ReraGalleryCategory" NOT NULL DEFAULT 'RESIDENTIAL',
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "thumbnailUrl" TEXT,
    "thumbnailPublicId" TEXT,
    "fileSizeBytes" INTEGER,
    "cloudinaryEtag" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReraGalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReraEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "interestedIn" "ReraInterest" NOT NULL DEFAULT 'BUY',
    "budgetLabel" TEXT,
    "locality" TEXT,
    "message" TEXT,
    "source" "ReraEnquirySource" NOT NULL DEFAULT 'CONTACT_FORM',
    "propertyId" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReraEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReraProperty_slug_key" ON "ReraProperty"("slug");

-- CreateIndex
CREATE INDEX "ReraProperty_isPublished_isFeatured_idx" ON "ReraProperty"("isPublished", "isFeatured");

-- CreateIndex
CREATE INDEX "ReraProperty_listingType_propertyType_idx" ON "ReraProperty"("listingType", "propertyType");

-- CreateIndex
CREATE INDEX "ReraPropertyImage_propertyId_idx" ON "ReraPropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "ReraGalleryItem_category_isPublished_idx" ON "ReraGalleryItem"("category", "isPublished");

-- CreateIndex
CREATE INDEX "ReraEnquiry_status_idx" ON "ReraEnquiry"("status");

-- CreateIndex
CREATE INDEX "ReraEnquiry_createdAt_idx" ON "ReraEnquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "ReraPropertyImage" ADD CONSTRAINT "ReraPropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ReraProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReraEnquiry" ADD CONSTRAINT "ReraEnquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ReraProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

