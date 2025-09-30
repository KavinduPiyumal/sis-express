/*
  Warnings:

  - The `status` column on the `Semester` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('student', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "public"."SemesterStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "public"."Semester" DROP COLUMN "status",
ADD COLUMN     "status" "public"."SemesterStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'student';
