export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * N-Player Prisoner's Dilemma scoring (Public Goods Game model).
 * Preserves original 2-player payoff as a special case.
 *
 * Cooperator score = 3 - (number of defectors in group)
 *   â†’ clamped to minimum of 0
 * Defector score = 5 if any cooperator exists, else 1 (all-defect)
 */
function computeScores(moves: { playerId: string; move: string }[]): Map<string, number> {
  const defectors = moves.filter(m => m.move === 'D').length;
  const cooperators = moves.length - defectors;
  const scores = new Map<string, number>();

  for (const m of moves) {
    if (m.move === 'C') {
      scores.set(m.playerId, Math.max(0, 3 - defectors));
    } else {
      // Defector
      scores.set(m.playerId, cooperators > 0 ? 5 : 1);
    }
  }
  return scores;
}

export async function POST(request: Request) {
  try {
    const { roomId, deviceId, move } = await request.json();
    if (!roomId || !deviceId || !move) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (move !== 'C' && move !== 'D') return NextResponse.json({ error: 'Invalid move' }, { status: 400 });

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true },
    });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.status !== 'playing') return NextResponse.json({ error: 'Game not active' }, { status: 400 });

    const player = room.players.find(p => p.deviceId === deviceId);
    if (!player) return NextResponse.json({ error: 'Not in room' }, { status: 403 });

    // Upsert submission (idempotent)
    await prisma.roundSubmission.upsert({
      where: { roomId_playerId_round: { roomId, playerId: player.id, round: room.currentRound } },
      create: { roomId, playerId: player.id, round: room.currentRound, move, score: 0 },
      update: { move },
    });

    // Check if all players have submitted for this round
    const submissions = await prisma.roundSubmission.findMany({
      where: { roomId, round: room.currentRound },
    });

    const allSubmitted = submissions.length === room.players.length;

    if (allSubmitted) {
      // Score the round
      const scores = computeScores(submissions.map(s => ({ playerId: s.playerId, move: s.move })));

      // Update each submission's score and each player's total
      for (const [pid, score] of scores.entries()) {
        await prisma.roundSubmission.updateMany({
          where: { roomId, playerId: pid, round: room.currentRound },
          data: { score },
        });
        await prisma.roomPlayer.update({
          where: { id: pid },
          data: { totalScore: { increment: score } },
        });
      }

      // Advance round or finish game
      const isLastRound = room.currentRound >= room.totalRounds;
      await prisma.gameRoom.update({
        where: { id: roomId },
        data: {
          currentRound: isLastRound ? room.currentRound : room.currentRound + 1,
          status: isLastRound ? 'finished' : 'playing',
        },
      });
    }

    return NextResponse.json({ submitted: true, allSubmitted });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
