-- CreateEnum
CREATE TYPE "Flow" AS ENUM ('none', 'spotting', 'light', 'medium', 'heavy');

-- CreateEnum
CREATE TYPE "CervicalMucus" AS ENUM ('dry', 'sticky', 'watery', 'eggwhite');

-- CreateEnum
CREATE TYPE "CervixPosition" AS ENUM ('firm', 'medium', 'soft');

-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('under18', 'b18_24', 'b25_34', 'b35_44', 'b45_plus');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('pcod', 'pmdd', 'endo', 'none', 'unsure');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('understand_body', 'track_period', 'ovulation_awareness', 'plan_life', 'manage_condition', 'learn');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'author');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('user', 'supporter', 'both');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "displayName" TEXT,
    "ageBand" "AgeBand",
    "conditions" "Condition"[] DEFAULT ARRAY[]::"Condition"[],
    "goals" "Goal"[] DEFAULT ARRAY[]::"Goal"[],
    "trackingBBT" BOOLEAN NOT NULL DEFAULT false,
    "trackingMucus" BOOLEAN NOT NULL DEFAULT false,
    "avgCycleLength" INTEGER,
    "avgPeriodLength" INTEGER,
    "tempUnit" TEXT NOT NULL DEFAULT 'F',
    "role" "Role" NOT NULL DEFAULT 'user',
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "length" INTEGER,
    "coverlineF" DECIMAL(5,2),
    "ovulationDay" INTEGER,
    "peakDay" INTEGER,
    "lutealLength" INTEGER,
    "isAnovulatory" BOOLEAN NOT NULL DEFAULT false,
    "confidence" TEXT,
    "confidenceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "flow" "Flow",
    "bbtF" DECIMAL(5,2),
    "tempTakenAt" TEXT,
    "isDisturbed" BOOLEAN NOT NULL DEFAULT false,
    "disturbedReason" TEXT,
    "cervicalMucus" "CervicalMucus",
    "cervixPosition" "CervixPosition",
    "mood" TEXT,
    "energy" INTEGER,
    "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleStartDate" DATE NOT NULL,
    "cycleLength" INTEGER NOT NULL,
    "ovulationDay" INTEGER,
    "peakDay" INTEGER,
    "lutealLength" INTEGER,
    "avgBbtF" DECIMAL(5,2),
    "symptomAggregate" JSONB NOT NULL,
    "energyAggregate" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "audience" "Audience" NOT NULL DEFAULT 'user',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoSub_key" ON "User"("cognitoSub");

-- CreateIndex
CREATE INDEX "Cycle_userId_startDate_idx" ON "Cycle"("userId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CycleSummary_userId_cycleStartDate_key" ON "CycleSummary"("userId", "cycleStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_isPublished_audience_idx" ON "BlogPost"("isPublished", "audience");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_slug_key" ON "KnowledgeArticle"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_category_orderIndex_idx" ON "KnowledgeArticle"("category", "orderIndex");

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleSummary" ADD CONSTRAINT "CycleSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
