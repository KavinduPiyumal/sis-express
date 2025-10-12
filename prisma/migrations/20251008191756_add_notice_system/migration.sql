/*
  Warnings:

  - The values [low,medium,urgent] on the enum `NoticePriority` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `Notice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."NoticeCategory" AS ENUM ('general', 'academic', 'finance', 'event', 'emergency');

-- CreateEnum
CREATE TYPE "public"."NoticeStatus" AS ENUM ('published', 'draft', 'archived');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."NoticePriority_new" AS ENUM ('normal', 'high', 'critical');
ALTER TABLE "public"."Notice" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "public"."Notice" ALTER COLUMN "priority" TYPE "public"."NoticePriority_new" USING ("priority"::text::"public"."NoticePriority_new");
ALTER TYPE "public"."NoticePriority" RENAME TO "NoticePriority_old";
ALTER TYPE "public"."NoticePriority_new" RENAME TO "NoticePriority";
DROP TYPE "public"."NoticePriority_old";
ALTER TABLE "public"."Notice" ALTER COLUMN "priority" SET DEFAULT 'normal';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Notice" ADD COLUMN     "category" "public"."NoticeCategory" NOT NULL DEFAULT 'general',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "public"."NoticeStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "priority" SET DEFAULT 'normal';

-- CreateTable
CREATE TABLE "public"."NoticeAttachment" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NoticeRead" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoticeAttachment_noticeId_idx" ON "public"."NoticeAttachment"("noticeId");

-- CreateIndex
CREATE INDEX "NoticeRead_noticeId_idx" ON "public"."NoticeRead"("noticeId");

-- CreateIndex
CREATE INDEX "NoticeRead_userId_idx" ON "public"."NoticeRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeRead_noticeId_userId_key" ON "public"."NoticeRead"("noticeId", "userId");

-- AddForeignKey
ALTER TABLE "public"."NoticeAttachment" ADD CONSTRAINT "NoticeAttachment_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "public"."Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NoticeRead" ADD CONSTRAINT "NoticeRead_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "public"."Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NoticeRead" ADD CONSTRAINT "NoticeRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
