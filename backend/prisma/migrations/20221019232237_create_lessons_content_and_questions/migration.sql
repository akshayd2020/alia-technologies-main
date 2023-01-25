-- AlterTable
ALTER TABLE "User" ALTER COLUMN "cooldownTime" DROP NOT NULL,
ALTER COLUMN "currentPoints" SET DEFAULT 0,
ALTER COLUMN "lifetimePoints" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "merchantID" INTEGER NOT NULL,
    "cooldownDuration" INTEGER,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "pointValue" INTEGER NOT NULL,
    "answerChoices" TEXT[],
    "correctAnswer" INTEGER NOT NULL,
    "contentID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" SERIAL NOT NULL,
    "lessonID" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "body" TEXT,
    "videoURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedQuestion" (
    "id" SERIAL NOT NULL,
    "questionID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CompletedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedLesson" (
    "id" SERIAL NOT NULL,
    "lessonID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CompletedLesson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_lessonID_fkey" FOREIGN KEY ("lessonID") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedQuestion" ADD CONSTRAINT "CompletedQuestion_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedQuestion" ADD CONSTRAINT "CompletedQuestion_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedLesson" ADD CONSTRAINT "CompletedLesson_lessonID_fkey" FOREIGN KEY ("lessonID") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedLesson" ADD CONSTRAINT "CompletedLesson_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
