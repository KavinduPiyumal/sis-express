/*
  Warnings:

  - A unique constraint covering the columns `[lecturerId]` on the table `Lecturer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lecturerId` to the `Lecturer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LecturerStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "public"."Lecturer" ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "lecturerId" TEXT NOT NULL,
ADD COLUMN     "status" "public"."LecturerStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_lecturerId_key" ON "public"."Lecturer"("lecturerId");
