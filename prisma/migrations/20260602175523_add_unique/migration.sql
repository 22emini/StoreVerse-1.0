/*
  Warnings:

  - A unique constraint covering the columns `[subDomain]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Store_subDomain_key" ON "Store"("subDomain");
