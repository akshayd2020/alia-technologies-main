/*
  Warnings:

  - Added the required column `cooldownDuration` to the `CompletedLesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompletedLesson" ADD COLUMN     "cooldownDuration" INTEGER NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CompletedQuestion" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
