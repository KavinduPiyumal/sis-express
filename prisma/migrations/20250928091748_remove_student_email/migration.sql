/*
  Warnings:

  - You are about to drop the column `email` on the `Lecturer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Lecturer" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "email";
