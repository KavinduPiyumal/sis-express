/*
  Warnings:

  - You are about to drop the column `title` on the `MedicalReport` table. All the data in the column will be lost.
  - Added the required column `classSessionId` to the `MedicalReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `MedicalReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MedicalReport" DROP COLUMN "title",
ADD COLUMN     "classSessionId" TEXT NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."MedicalReport" ADD CONSTRAINT "MedicalReport_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "public"."ClassSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
