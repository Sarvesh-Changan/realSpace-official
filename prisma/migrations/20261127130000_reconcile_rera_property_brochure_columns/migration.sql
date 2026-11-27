-- The original brochure migration may already be recorded in _prisma_migrations
-- on databases where its columns were later removed or not created. Keep this
-- repair additive and safe to apply to databases that already have the fields.
ALTER TABLE "ReraProperty"
ADD COLUMN IF NOT EXISTS "brochureUrl" TEXT;

ALTER TABLE "ReraProperty"
ADD COLUMN IF NOT EXISTS "brochurePublicId" TEXT;
