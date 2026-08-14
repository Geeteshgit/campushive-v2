/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `carpools` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "carpools_expiresAt_idx";

-- AlterTable
ALTER TABLE "carpools" DROP COLUMN "expiresAt";
