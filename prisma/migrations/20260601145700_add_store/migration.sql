-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "image" TEXT,
    "storeName" TEXT,
    "category" TEXT,
    "businessAddress" TEXT,
    "country" TEXT,
    "currency" TEXT,
    "subDomain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
