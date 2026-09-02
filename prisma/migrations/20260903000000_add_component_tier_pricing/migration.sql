-- CreateEnum
CREATE TYPE "PricingTier" AS ENUM ('STANDARD', 'PREMIUM', 'LUXURY');

-- CreateTable
CREATE TABLE "ComponentPricing" (
    "id" TEXT NOT NULL,
    "componentKey" TEXT NOT NULL,
    "tier" "PricingTier" NOT NULL,
    "pricePerUnit" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComponentPricing_componentKey_tier_key" ON "ComponentPricing"("componentKey", "tier");
