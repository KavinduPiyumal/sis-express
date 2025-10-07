/*
  Warnings:

  - Added the required column `updatedAt` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LinkPriority" AS ENUM ('normal', 'highlight');

-- CreateEnum
CREATE TYPE "public"."OpenMode" AS ENUM ('newtab', 'sametab');

-- AlterTable
ALTER TABLE "public"."Link" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "openMode" "public"."OpenMode" NOT NULL DEFAULT 'newtab',
ADD COLUMN     "priority" "public"."LinkPriority" NOT NULL DEFAULT 'normal',
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
