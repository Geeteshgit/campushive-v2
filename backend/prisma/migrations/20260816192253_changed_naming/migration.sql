-- DropForeignKey
ALTER TABLE "carpools" DROP CONSTRAINT "carpools_userId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "carpools" ADD CONSTRAINT "carpools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
