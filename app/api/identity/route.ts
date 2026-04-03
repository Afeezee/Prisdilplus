import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });

  const user = await prisma.userIdentity.findUnique({
    where: { deviceId },
  });

  return NextResponse.json({ identity: user });
}

export async function POST(request: Request) {
  try {
    const { deviceId, alias } = await request.json();
    
    if (!deviceId || !alias) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await prisma.userIdentity.upsert({
      where: { deviceId },
      update: { alias },
      create: { deviceId, alias },
    });

    return NextResponse.json({ identity: user });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request); // Alias updates use the same logic
}
