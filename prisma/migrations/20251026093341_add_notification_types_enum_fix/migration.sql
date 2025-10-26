-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'enrollment';
ALTER TYPE "public"."NotificationType" ADD VALUE 'attendance';
ALTER TYPE "public"."NotificationType" ADD VALUE 'fee';
ALTER TYPE "public"."NotificationType" ADD VALUE 'gpa';
ALTER TYPE "public"."NotificationType" ADD VALUE 'transcript';
ALTER TYPE "public"."NotificationType" ADD VALUE 'approval';
ALTER TYPE "public"."NotificationType" ADD VALUE 'rejection';
ALTER TYPE "public"."NotificationType" ADD VALUE 'info';
ALTER TYPE "public"."NotificationType" ADD VALUE 'warning';
ALTER TYPE "public"."NotificationType" ADD VALUE 'event';
ALTER TYPE "public"."NotificationType" ADD VALUE 'message';
