-- CreateTable
CREATE TABLE "PendingCognitoDeletion" (
    "id" TEXT NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingCognitoDeletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingCognitoDeletion_cognitoSub_key" ON "PendingCognitoDeletion"("cognitoSub");
