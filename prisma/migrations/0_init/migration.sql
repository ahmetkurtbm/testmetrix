-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "AnswerOption" AS ENUM ('A', 'B', 'C', 'D', 'E', 'BOS');

-- CreateTable
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "passwordHash" TEXT,
    "university" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "kvkkAcceptedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_key" (
    "examId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "correctOption" "AnswerOption" NOT NULL,

    CONSTRAINT "answer_key_pkey" PRIMARY KEY ("examId","questionNo")
);

-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "rowNo" INTEGER NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "option" "AnswerOption" NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("examId","studentId","questionNo")
);

-- CreateTable
CREATE TABLE "exam_stat" (
    "examId" TEXT NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "median" DOUBLE PRECISION,
    "minScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "range" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION NOT NULL,
    "stdDeviation" DOUBLE PRECISION NOT NULL,
    "skewness" DOUBLE PRECISION,
    "kurtosis" DOUBLE PRECISION,
    "coefficientVariation" DOUBLE PRECISION,
    "successRate" DOUBLE PRECISION,
    "kr20" DOUBLE PRECISION,
    "kr21" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_stat_pkey" PRIMARY KEY ("examId")
);

-- CreateTable
CREATE TABLE "item_stat" (
    "examId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "stdDeviation" DOUBLE PRECISION NOT NULL,
    "discrimination" DOUBLE PRECISION NOT NULL,
    "rbis" DOUBLE PRECISION,
    "prbis" DOUBLE PRECISION,
    "reliabilityIndex" DOUBLE PRECISION,

    CONSTRAINT "item_stat_pkey" PRIMARY KEY ("examId","questionNo")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_tokenHash_key" ON "password_reset_token"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_token_userId_idx" ON "password_reset_token"("userId");

-- CreateIndex
CREATE INDEX "folder_ownerId_sortOrder_idx" ON "folder"("ownerId", "sortOrder");

-- CreateIndex
CREATE INDEX "exam_ownerId_idx" ON "exam"("ownerId");

-- CreateIndex
CREATE INDEX "exam_folderId_idx" ON "exam"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "student_examId_rowNo_key" ON "student"("examId", "rowNo");

-- CreateIndex
CREATE INDEX "answer_examId_questionNo_idx" ON "answer"("examId", "questionNo");

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_key" ADD CONSTRAINT "answer_key_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_stat" ADD CONSTRAINT "exam_stat_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_stat" ADD CONSTRAINT "item_stat_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
