-- CreateEnum
CREATE TYPE "public"."FeeTypeCategory" AS ENUM ('general', 'batchwise', 'semesterwise');

-- AlterTable
ALTER TABLE "public"."fee_types" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "semesterId" TEXT,
ADD COLUMN     "type" "public"."FeeTypeCategory" NOT NULL DEFAULT 'general';

-- AddForeignKey
ALTER TABLE "public"."fee_types" ADD CONSTRAINT "fee_types_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_types" ADD CONSTRAINT "fee_types_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
