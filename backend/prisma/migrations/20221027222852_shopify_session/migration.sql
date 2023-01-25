/*
  Warnings:

  - You are about to drop the column `shopifyCustomerId` on the `User` table. All the data in the column will be lost.
  - Added the required column `shopifyCustomerID` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "shopifyCustomerId",
ADD COLUMN     "shopifyCustomerID" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "shopify_sessions" (
    "id" VARCHAR(255) NOT NULL,
    "shop" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "isonline" BOOLEAN NOT NULL,
    "scope" VARCHAR(255),
    "expires" INTEGER,
    "onlineaccessinfo" VARCHAR(255),
    "accesstoken" VARCHAR(255),

    CONSTRAINT "shopify_sessions_pkey" PRIMARY KEY ("id")
);
