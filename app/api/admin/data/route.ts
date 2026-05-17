import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [profiles, sessions] = await Promise.all([
      prisma.playerProfile.findMany({
        include: { user: true },
      }),
      prisma.gameSession.findMany({
        include: { rounds: { orderBy: { round: 'asc' } } },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    const players = profiles.map(p => ({
      alias: p.user.alias,
      deviceId: p.user.deviceId,
      createdAt: p.user.createdAt.toISOString(),
      totalPoints: p.totalPoints,
      totalWins: p.totalWins,
      totalLosses: p.totalLosses,
      totalDraws: p.totalDraws,
      gamesPlayed: p.gamesPlayed,
      totalCooperateMoves: p.totalCooperateMoves,
      totalDefectMoves: p.totalDefectMoves,
      totalMoves: p.totalMoves,
      totalRetaliations: p.totalRetaliations,
      totalBetrayalsFaced: p.totalBetrayalsFaced,
      totalForgivenessEvents: p.totalForgivenessEvents,
      totalRetaliationSequences: p.totalRetaliationSequences,
      totalDefectionsAfterOpponentCoop: p.totalDefectionsAfterOpponentCoop,
      totalDefections: p.totalDefections,
      totalCooperationsAfterOpponentDefect: p.totalCooperationsAfterOpponentDefect,
      totalOpponentDefections: p.totalOpponentDefections,
      longestStreak: p.longestStreak,
      longestWinStreak: p.longestWinStreak,
      currentWinStreak: p.currentWinStreak,
      totalRoundsPlayed: p.totalRoundsPlayed,
      badges: JSON.parse(p.badges || '[]'),
    }));

    const formattedSessions = sessions.map(s => ({
      sessionId: s.id,
      timestamp: s.timestamp.toISOString(),
      gameMode: s.gameMode,
      playerAlias: s.playerAlias,
      opponentAlias: s.opponentAlias,
      opponentType: s.opponentType,
      aiStrategy: s.aiStrategy,
      totalRounds: s.totalRounds,
      playerTotalScore: s.playerTotalScore,
      opponentTotalScore: s.opponentTotalScore,
      winner: s.winner,
      playerBehaviouralProfile: s.playerBehaviouralProfile,
      playerMetrics: s.playerMetrics ? JSON.parse(s.playerMetrics) : null,
      roundHistory: s.rounds.map(r => ({
        round: r.round,
        playerMove: r.playerMove,
        opponentMove: r.opponentMove,
        playerScore: r.playerScore,
        opponentScore: r.opponentScore,
        cumulativePlayerScore: r.cumulativePlayerScore,
        cumulativeOpponentScore: r.cumulativeOpponentScore,
      })),
    }));

    return NextResponse.json({ players, sessions: formattedSessions });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
