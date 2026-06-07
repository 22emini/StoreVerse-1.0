-- CreateTable
CREATE TABLE "Customize" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "primaryColor" TEXT,
    "fontFamily" TEXT,
    "storeLogoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customize_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Customize" ADD CONSTRAINT "Customize_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
