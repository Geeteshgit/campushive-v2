/*
  Warnings:

  - You are about to drop the column `carPoolId` on the `carpool_members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[carpoolId,userId]` on the table `carpool_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `carpoolId` to the `carpool_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "carpool_members" DROP CONSTRAINT "carpool_members_carPoolId_fkey";

-- DropIndex
DROP INDEX "carpool_members_carPoolId_userId_key";

-- AlterTable
ALTER TABLE "carpool_members" DROP COLUMN "carPoolId",
ADD COLUMN     "carpoolId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "carpool_members_carpoolId_userId_key" ON "carpool_members"("carpoolId", "userId");

-- AddForeignKey
ALTER TABLE "carpool_members" ADD CONSTRAINT "carpool_members_carpoolId_fkey" FOREIGN KEY ("carpoolId") REFERENCES "carpools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
