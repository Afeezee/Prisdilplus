export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { roomId, deviceId } = await request.json();
    if (!roomId || !deviceId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const room = await prisma.gameRoom.findUnique({ where: { id: roomId }, include: { players: true } });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.hostDeviceId !== deviceId) return NextResponse.json({ error: 'Not the host' }, { status: 403 });
    if (room.players.length < 2) return NextResponse.json({ error: 'Need at least 2 players' }, { status: 400 });
    if (room.status !== 'waiting') return NextResponse.json({ error: 'Already started' }, { status: 400 });

    const updated = await prisma.gameRoom.update({
      where: { id: roomId },
      data: { status: 'playing' },
      include: { players: true },
    });

    return NextResponse.json({ room: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
