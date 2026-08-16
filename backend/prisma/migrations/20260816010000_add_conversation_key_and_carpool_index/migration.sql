-- A stable key prevents duplicate public rooms and duplicate direct-message threads.
ALTER TABLE "conversations" ADD COLUMN "key" TEXT;

UPDATE "conversations"
SET "key" = 'legacy-' || "id";

UPDATE "conversations"
SET "key" = 'public'
WHERE "id" = (
  SELECT "id"
  FROM "conversations"
  WHERE "type" = 'PUBLIC'
  ORDER BY "createdAt" ASC
  LIMIT 1
);

ALTER TABLE "conversations" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "conversations_key_key" ON "conversations"("key");
CREATE INDEX "carpools_departureTime_idx" ON "carpools"("departureTime");
