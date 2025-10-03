-- AlterTable
ALTER TABLE "public"."DegreeProgram" ADD COLUMN     "honorsCriteria" TEXT,
ADD COLUMN     "minCGPARequired" DOUBLE PRECISION,
ADD COLUMN     "minCreditsToGraduate" INTEGER;
