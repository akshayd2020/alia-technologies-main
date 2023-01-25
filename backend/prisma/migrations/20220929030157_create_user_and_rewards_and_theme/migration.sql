/*
  Warnings:

  - Added the required column `createdAt` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cooldownTime` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPoints` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lifetimePoints` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cooldownTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "currentPoints" INTEGER NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lifetimePoints" INTEGER NOT NULL,
ADD COLUMN     "merchantId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "pointCost" INTEGER NOT NULL,
    "rewardVal" INTEGER,
    "rewardPer" DECIMAL(65,30),
    "enabled" BOOLEAN NOT NULL,
    "userCapacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimedReward" (
    "id" SERIAL NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClaimedReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "colorSet" INTEGER NOT NULL,
    "iconSet" INTEGER NOT NULL,
    "font" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimedReward" ADD CONSTRAINT "ClaimedReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
