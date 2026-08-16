-- Messages may contain text, an image attachment, or both.
ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;
ALTER TABLE "messages" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "messages" ADD COLUMN "imageId" TEXT;
