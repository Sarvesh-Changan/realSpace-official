-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('COURSE', 'MEMBERSHIP', 'REGISTRATION');

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "certificateType" "CertificationType" NOT NULL,
    "issueDate" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "badgeLabel" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);
