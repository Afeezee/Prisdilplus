import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      gameMode, playerAlias, playerDeviceId, opponentAlias, opponentType,
      aiStrategy, totalRounds, playerTotalScore, opponentTotalScore,
      winner, playerBehaviouralProfile, playerMetrics, roundHistory,
    } = data;

    if (!playerAlias || !opponentAlias || !roundHistory) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await prisma.gameSession.create({
      data: {
        gameMode: gameMode || 'PvAI',
        playerAlias,
        playerDeviceId: playerDeviceId || null,
        opponentAlias,
        opponentType: opponentType || 'ai',
        aiStrategy: aiStrategy || null,
        totalRounds: totalRounds || roundHistory.length,
        playerTotalScore: playerTotalScore || 0,
        opponentTotalScore: opponentTotalScore || 0,
        winner: winner || 'tie',
        playerBehaviouralProfile: playerBehaviouralProfile || null,
        playerMetrics: playerMetrics ? JSON.stringify(playerMetrics) : null,
        rounds: {
          create: roundHistory.map((r: any) => ({
            round: r.round,
            playerMove: r.playerMove,
            opponentMove: r.opponentMove,
            playerScore: r.playerScore || 0,
            opponentScore: r.opponentScore || 0,
            cumulativePlayerScore: r.cumulativePlayerScore || 0,
            cumulativeOpponentScore: r.cumulativeOpponentScore || 0,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
