-- CreateTable
CREATE TABLE "GalleryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "designType" "DesignType" NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "cloudinaryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "theme" TEXT,
    "approxBudgetLabel" TEXT,
    "description" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryCategory_name_key" ON "GalleryCategory"("name");

-- CreateIndex
CREATE INDEX "GalleryImage_categoryId_idx" ON "GalleryImage"("categoryId");

-- CreateIndex
CREATE INDEX "GalleryImage_designType_categoryId_idx" ON "GalleryImage"("designType", "categoryId");

-- CreateIndex
CREATE INDEX "GalleryImage_isFeatured_isPublished_idx" ON "GalleryImage"("isFeatured", "isPublished");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GalleryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
