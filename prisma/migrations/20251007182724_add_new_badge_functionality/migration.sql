-- AlterTable
ALTER TABLE "public"."Link" ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."LinkView" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkView_linkId_idx" ON "public"."LinkView"("linkId");

-- CreateIndex
CREATE INDEX "LinkView_userId_idx" ON "public"."LinkView"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkView_linkId_userId_key" ON "public"."LinkView"("linkId", "userId");

-- AddForeignKey
ALTER TABLE "public"."LinkView" ADD CONSTRAINT "LinkView_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "public"."Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkView" ADD CONSTRAINT "LinkView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
