/*
  Warnings:

  - Added the required column `updatedAt` to the `Segment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Segment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'custom',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
