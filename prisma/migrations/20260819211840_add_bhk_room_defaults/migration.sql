-- CreateTable
CREATE TABLE "BhkRoomDefault" (
    "id" TEXT NOT NULL,
    "bhkOptionId" TEXT NOT NULL,
    "roomGroupKey" TEXT NOT NULL,
    "defaultQty" INTEGER NOT NULL,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER,
    "isFixedFloor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BhkRoomDefault_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BhkRoomDefault_bhkOptionId_idx" ON "BhkRoomDefault"("bhkOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BhkRoomDefault_bhkOptionId_roomGroupKey_key" ON "BhkRoomDefault"("bhkOptionId", "roomGroupKey");

-- AddForeignKey
ALTER TABLE "BhkRoomDefault" ADD CONSTRAINT "BhkRoomDefault_bhkOptionId_fkey" FOREIGN KEY ("bhkOptionId") REFERENCES "PricingOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
