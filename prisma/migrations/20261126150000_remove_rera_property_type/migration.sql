-- Preserve existing property classification in the category relation before
-- removing the legacy RERA propertyType field.
UPDATE "ReraProperty" AS property
SET "categoryId" = category."id"
FROM "ReraPropertyCategory" AS category
WHERE property."categoryId" IS NULL
  AND (
    (property."propertyType" = 'APARTMENT' AND category."slug" = 'apartment') OR
    (property."propertyType" = 'VILLA' AND category."slug" = 'villa') OR
    (property."propertyType" = 'COMMERCIAL' AND category."slug" = 'commercial') OR
    (property."propertyType" = 'PLOT' AND category."slug" = 'plot')
  );

DROP INDEX IF EXISTS "ReraProperty_listingType_propertyType_idx";
ALTER TABLE "ReraProperty" DROP COLUMN "propertyType";
DROP TYPE "ReraPropertyType";
