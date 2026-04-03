import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlayerProfile as PlayerProfileType } from '@/lib/types';

export async function GET() {
  const profiles = await prisma.playerProfile.findMany({
    include: { user: true },
  });

  // Map to the frontend PlayerProfile format expected by stores
  const formattedProfiles = profiles.map(p => ({
    alias: p.user.alias,
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
    badges: JSON.parse(p.badges || "[]"),
  }));

  // Convert to lookup object expected by leaderboardStore
  const playersLookUp: Record<string, PlayerProfileType> = {};
  formattedProfiles.forEach(fp => {
    playersLookUp[fp.alias] = fp;
  });

  return NextResponse.json({ players: playersLookUp });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { deviceId, update } = data;

    if (!deviceId || !update) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Ensure user exists
    const user = await prisma.userIdentity.findUnique({
      where: { deviceId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newWinStreak = update.won ? (user.profile?.currentWinStreak || 0) + 1 : 0;
    const existing = user.profile || {
      totalPoints: 0, totalWins: 0, totalLosses: 0, totalDraws: 0, gamesPlayed: 0,
      totalCooperateMoves: 0, totalDefectMoves: 0, totalMoves: 0, totalRetaliations: 0,
      totalBetrayalsFaced: 0, totalForgivenessEvents: 0, totalRetaliationSequences: 0,
      totalDefectionsAfterOpponentCoop: 0, totalDefections: 0, totalCooperationsAfterOpponentDefect: 0,
      totalOpponentDefections: 0, longestStreak: 0, longestWinStreak: 0, currentWinStreak: 0, totalRoundsPlayed: 0,
      badges: "[]"
    };

    const newProfileData = {
      totalPoints: existing.totalPoints + update.points,
      totalWins: existing.totalWins + (update.won ? 1 : 0),
      totalLosses: existing.totalLosses + (update.lost ? 1 : 0),
      totalDraws: existing.totalDraws + (update.draw ? 1 : 0),
      gamesPlayed: existing.gamesPlayed + 1,
      totalCooperateMoves: existing.totalCooperateMoves + update.totalCooperateMoves,
      totalDefectMoves: existing.totalDefectMoves + update.totalDefectMoves,
      totalMoves: existing.totalMoves + update.totalMoves,
      totalRetaliations: existing.totalRetaliations + update.retaliations,
      totalBetrayalsFaced: existing.totalBetrayalsFaced + update.betrayalsFaced,
      totalForgivenessEvents: existing.totalForgivenessEvents + update.forgiveEvents,
      totalRetaliationSequences: existing.totalRetaliationSequences + update.retaliationSequences,
      totalDefectionsAfterOpponentCoop: existing.totalDefectionsAfterOpponentCoop + update.defectAfterOpponentCoop,
      totalDefections: existing.totalDefections + update.totalDefections,
      totalCooperationsAfterOpponentDefect: existing.totalCooperationsAfterOpponentDefect + update.cooperateAfterOpponentDefect,
      totalOpponentDefections: existing.totalOpponentDefections + update.totalOpponentDefections,
      longestStreak: Math.max(existing.longestStreak, update.longestStreak),
      longestWinStreak: Math.max(existing.longestWinStreak, newWinStreak),
      currentWinStreak: newWinStreak,
      totalRoundsPlayed: existing.totalRoundsPlayed + update.roundsPlayed,
      userId: user.id
    };

    const updatedProfile = await prisma.playerProfile.upsert({
      where: { userId: user.id },
      create: newProfileData,
      update: newProfileData
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
