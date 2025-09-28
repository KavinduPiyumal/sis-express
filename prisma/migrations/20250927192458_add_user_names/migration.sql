/*
  Warnings:

  - You are about to drop the column `fullName` on the `Lecturer` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Student` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lecturer" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
