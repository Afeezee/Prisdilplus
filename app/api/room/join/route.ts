export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, deviceId, alias } = await request.json();
    if (!code || !deviceId || !alias) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true },
    });

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.status !== 'waiting') return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    if (room.players.length >= room.maxPlayers) return NextResponse.json({ error: 'Room is full' }, { status: 400 });

    // Check if already in room
    const alreadyIn = room.players.find(p => p.deviceId === deviceId);
    if (alreadyIn) {
      // Already joined â€” just return the room
      return NextResponse.json({ room });
    }

    const updated = await prisma.gameRoom.update({
      where: { id: room.id },
      data: {
        players: {
          create: { deviceId, alias, isHost: false },
        },
      },
      include: { players: true },
    });

    return NextResponse.json({ room: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
