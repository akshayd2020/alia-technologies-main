/*
  Warnings:

  - Added the required column `userID` to the `ClaimedReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClaimedReward" ADD COLUMN     "userID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ClaimedReward" ADD CONSTRAINT "ClaimedReward_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
