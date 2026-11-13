CREATE TABLE "ArnavPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArnavPage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ArnavPageSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "heading" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "buttonLabel" TEXT,
    "buttonUrl" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArnavPageSection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ArnavMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT,
    "altText" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArnavMedia_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArnavPage_slug_key" ON "ArnavPage"("slug");
CREATE UNIQUE INDEX "ArnavPageSection_pageId_sectionKey_key" ON "ArnavPageSection"("pageId", "sectionKey");
CREATE INDEX "ArnavPageSection_pageId_sortOrder_idx" ON "ArnavPageSection"("pageId", "sortOrder");
ALTER TABLE "ArnavPageSection" ADD CONSTRAINT "ArnavPageSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ArnavPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
