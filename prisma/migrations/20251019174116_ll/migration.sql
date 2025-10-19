/*
  Warnings:

  - You are about to drop the column `downloadUrl` on the `MedicalReportAttachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MedicalReportAttachment" DROP COLUMN "downloadUrl",
ADD COLUMN     "url" TEXT;
