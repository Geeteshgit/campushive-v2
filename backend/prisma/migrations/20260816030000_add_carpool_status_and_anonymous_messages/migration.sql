CREATE TYPE "CarpoolStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

ALTER TABLE "carpools"
ADD COLUMN "status" "CarpoolStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "carpools"
SET "status" = 'EXPIRED'
WHERE "departureTime" <= CURRENT_TIMESTAMP;

ALTER TABLE "messages" ALTER COLUMN "senderId" DROP NOT NULL;
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";
ALTER TABLE "messages"
ADD CONSTRAINT "messages_senderId_fkey"
FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
