/*
  Warnings:

  - The values [late] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[classSessionId,studentId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AttendanceStatus_new" AS ENUM ('present', 'absent', 'excused');
ALTER TABLE "public"."Attendance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Attendance" ALTER COLUMN "status" TYPE "public"."AttendanceStatus_new" USING ("status"::text::"public"."AttendanceStatus_new");
ALTER TYPE "public"."AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "public"."AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
ALTER TABLE "public"."Attendance" ALTER COLUMN "status" SET DEFAULT 'present';
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_classSessionId_studentId_key" ON "public"."Attendance"("classSessionId", "studentId");
