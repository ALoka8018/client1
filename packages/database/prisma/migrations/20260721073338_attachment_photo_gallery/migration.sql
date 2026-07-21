/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `BookingAttachment` table. All the data in the column will be lost.
  - Added the required column `fileKey` to the `BookingAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentPhotoType" AS ENUM ('BEFORE', 'AFTER');

-- AlterTable
ALTER TABLE "BookingAttachment" DROP COLUMN "fileUrl",
ADD COLUMN     "consentedAt" TIMESTAMP(3),
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fileKey" TEXT NOT NULL,
ADD COLUMN     "photoType" "AttachmentPhotoType";

-- CreateIndex
CREATE INDEX "BookingAttachment_featured_idx" ON "BookingAttachment"("featured");
