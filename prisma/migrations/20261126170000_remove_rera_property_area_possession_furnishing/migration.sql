-- Remove property area, possession, and furnishing disclosures from RERA property listings.
ALTER TABLE "ReraProperty"
  DROP COLUMN "carpetAreaSqFt",
  DROP COLUMN "builtUpAreaSqFt",
  DROP COLUMN "possession",
  DROP COLUMN "furnishing";