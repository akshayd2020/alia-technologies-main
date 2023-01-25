-- CreateTable
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);
