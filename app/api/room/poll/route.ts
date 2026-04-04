export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const deviceId = searchParams.get('deviceId');

    if (!roomId || !deviceId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: {
        players: { orderBy: { joinedAt: 'asc' } },
        submissions: { orderBy: [{ round: 'asc' }, { submittedAt: 'asc' }] },
      },
    });

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const player = room.players.find(p => p.deviceId === deviceId);

    // Determine the round whose results to show:
    // The last fully-submitted round (i.e., currentRound - 1 after advance, or currentRound if finished)
    const revealRound = room.status === 'finished' ? room.currentRound : room.currentRound - 1;

    // Submissions are only visible once all players submitted (reveal phase)
    const revealedSubmissions = revealRound >= 1
      ? room.submissions.filter(s => s.round === revealRound)
      : [];

    // Whether this player already submitted for the current round
    const mySubmission = player
      ? room.submissions.find(s => s.playerId === player.id && s.round === room.currentRound)
      : null;

    // How many have submitted for current round
    const submittedCount = room.submissions.filter(s => s.round === room.currentRound).length;

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        status: room.status,
        maxPlayers: room.maxPlayers,
        totalRounds: room.totalRounds,
        currentRound: room.currentRound,
        hostDeviceId: room.hostDeviceId,
      },
      players: room.players.map(p => ({
        id: p.id,
        alias: p.alias,
        deviceId: p.deviceId,
        isHost: p.isHost,
        totalScore: p.totalScore,
      })),
      myPlayerId: player?.id ?? null,
      mySubmittedThisRound: !!mySubmission,
      submittedCount,
      revealedSubmissions: revealedSubmissions.map(s => ({
        playerId: s.playerId,
        move: s.move,
        score: s.score,
        round: s.round,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
