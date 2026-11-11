ALTER TABLE "ReraSettings"
ADD COLUMN "heroSlidesJson" TEXT,
ADD COLUMN "heroSlideInterval" INTEGER NOT NULL DEFAULT 8;
