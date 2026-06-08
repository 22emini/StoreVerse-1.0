-- CreateTable
CREATE TABLE "Segment" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "conditionOne" TEXT,
    "conditionTwo" TEXT,
    "conditionThree" TEXT,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;
