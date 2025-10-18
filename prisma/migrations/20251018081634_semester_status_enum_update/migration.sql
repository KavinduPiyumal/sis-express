/*
  Warnings:

  - The values [active,inactive] on the enum `SemesterStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SemesterStatus_new" AS ENUM ('inprogress', 'pending', 'completed');
ALTER TABLE "public"."Semester" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Semester" ALTER COLUMN "status" TYPE "public"."SemesterStatus_new" USING ("status"::text::"public"."SemesterStatus_new");
ALTER TYPE "public"."SemesterStatus" RENAME TO "SemesterStatus_old";
ALTER TYPE "public"."SemesterStatus_new" RENAME TO "SemesterStatus";
DROP TYPE "public"."SemesterStatus_old";
ALTER TABLE "public"."Semester" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Semester" ALTER COLUMN "status" SET DEFAULT 'pending';
