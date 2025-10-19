/*
  Warnings:

  - You are about to drop the column `medicalId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `MedicalReport` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `MedicalReport` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `MedicalReport` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `MedicalReport` table. All the data in the column will be lost.
  - You are about to drop the `Medical` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_medicalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Medical" DROP CONSTRAINT "Medical_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Medical" DROP CONSTRAINT "Medical_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Attendance" DROP COLUMN "medicalId",
ADD COLUMN     "medicalReportId" TEXT;

-- AlterTable
ALTER TABLE "public"."MedicalReport" DROP COLUMN "endDate",
DROP COLUMN "fileName",
DROP COLUMN "filePath",
DROP COLUMN "startDate",
ADD COLUMN     "submitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."Medical";

-- CreateTable
CREATE TABLE "public"."MedicalReportAttachment" (
    "id" TEXT NOT NULL,
    "medicalReportId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalReportAttachment_medicalReportId_idx" ON "public"."MedicalReportAttachment"("medicalReportId");

-- AddForeignKey
ALTER TABLE "public"."MedicalReportAttachment" ADD CONSTRAINT "MedicalReportAttachment_medicalReportId_fkey" FOREIGN KEY ("medicalReportId") REFERENCES "public"."MedicalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_medicalReportId_fkey" FOREIGN KEY ("medicalReportId") REFERENCES "public"."MedicalReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
