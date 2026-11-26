-- Remove property pricing disclosures from the RERA property data model.
ALTER TABLE "ReraProperty"
  DROP COLUMN "priceLabel",
  DROP COLUMN "priceAmount";
