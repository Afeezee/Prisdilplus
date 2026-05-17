-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameMode" TEXT NOT NULL,
    "playerAlias" TEXT NOT NULL,
    "playerDeviceId" TEXT,
    "opponentAlias" TEXT NOT NULL,
    "opponentType" TEXT NOT NULL,
    "aiStrategy" TEXT,
    "totalRounds" INTEGER NOT NULL,
    "playerTotalScore" INTEGER NOT NULL,
    "opponentTotalScore" INTEGER NOT NULL,
    "winner" TEXT NOT NULL,
    "playerBehaviouralProfile" TEXT,
    "playerMetrics" TEXT,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRound" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "playerMove" TEXT NOT NULL,
    "opponentMove" TEXT NOT NULL,
    "playerScore" INTEGER NOT NULL,
    "opponentScore" INTEGER NOT NULL,
    "cumulativePlayerScore" INTEGER NOT NULL,
    "cumulativeOpponentScore" INTEGER NOT NULL,

    CONSTRAINT "SessionRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionRound_sessionId_round_key" ON "SessionRound"("sessionId", "round");

-- AddForeignKey
ALTER TABLE "SessionRound" ADD CONSTRAINT "SessionRound_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
