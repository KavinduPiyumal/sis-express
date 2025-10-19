-- DropForeignKey
ALTER TABLE "public"."MedicalReport" DROP CONSTRAINT "MedicalReport_studentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."MedicalReport" ADD CONSTRAINT "MedicalReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
