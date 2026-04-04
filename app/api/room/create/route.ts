export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const { deviceId, alias, maxPlayers, totalRounds } = await request.json();
    if (!deviceId || !alias) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Generate a unique room code
    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.gameRoom.findUnique({ where: { code } });
      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const room = await prisma.gameRoom.create({
      data: {
        code,
        hostDeviceId: deviceId,
        maxPlayers: maxPlayers ?? 2,
        totalRounds: totalRounds ?? 10,
        players: {
          create: {
            deviceId,
            alias,
            isHost: true,
          },
        },
      },
      include: { players: true },
    });

    return NextResponse.json({ room });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
