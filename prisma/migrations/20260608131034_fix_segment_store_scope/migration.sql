/*
  Warnings:

  - You are about to drop the column `conditionOne` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the column `conditionThree` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the column `conditionTwo` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Segment` table. All the data in the column will be lost.
  - Added the required column `storeId` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Segment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Segment" DROP CONSTRAINT "Segment_customerId_fkey";

-- AlterTable
ALTER TABLE "Segment" DROP COLUMN "conditionOne",
DROP COLUMN "conditionThree",
DROP COLUMN "conditionTwo",
DROP COLUMN "customerId",
ADD COLUMN     "conditions" TEXT,
ADD COLUMN     "storeId" INTEGER NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
