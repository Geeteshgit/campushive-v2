-- Preserve shared carpool and message history when an account is deleted.
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);
