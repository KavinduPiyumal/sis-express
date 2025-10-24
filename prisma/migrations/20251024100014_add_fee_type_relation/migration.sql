-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "feeTypeId" TEXT,
ALTER COLUMN "paymentType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_feeTypeId_fkey" FOREIGN KEY ("feeTypeId") REFERENCES "public"."fee_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
