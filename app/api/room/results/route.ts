export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Returns the full move history for a room so the client can compute
 * behavioural insights at the end of a multiplayer game (mirroring the
 * single-player results screen).
 *
 * For each player we return their ordered move sequence. The client derives
 * the per-round "opponent" move as the group's behaviour (defection if any
 * other player defected that round) — which reduces to the opponent's move in
 * a 2-player game.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: {
        players: { orderBy: { joinedAt: 'asc' } },
        submissions: { orderBy: { round: 'asc' } },
      },
    });

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // Build ordered move/score arrays per player.
    const rounds = Array.from({ length: room.totalRounds }, (_, i) => i + 1);
    const players = room.players.map(p => {
      const playerSubs = room.submissions.filter(s => s.playerId === p.id);
      const moves: string[] = [];
      const scores: number[] = [];
      for (const r of rounds) {
        const sub = playerSubs.find(s => s.round === r);
        if (sub) {
          moves.push(sub.move);
          scores.push(sub.score);
        }
      }
      return {
        id: p.id,
        alias: p.alias,
        deviceId: p.deviceId,
        isHost: p.isHost,
        totalScore: p.totalScore,
        moves,
        scores,
      };
    });

    return NextResponse.json({
      roomId: room.id,
      code: room.code,
      status: room.status,
      totalRounds: room.totalRounds,
      players,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
