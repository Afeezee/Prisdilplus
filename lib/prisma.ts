import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Pool } from 'pg';

const url = process.env.DATABASE_URL ?? '';

// Prisma Accelerate / Prisma Postgres URLs ("prisma://" or "prisma+postgres://")
// speak an HTTP protocol and must be used via the Accelerate client extension —
// the raw `pg` driver adapter cannot connect to them. A standard
// "postgres://" / "postgresql://" URL uses the pg driver adapter directly.
const isAccelerateUrl = url.startsWith('prisma://') || url.startsWith('prisma+postgres://');

const logLevels = (process.env.NODE_ENV === 'development'
  ? ['query', 'error', 'warn']
  : ['error']) as ('query' | 'error' | 'warn')[];

// Both branches are normalised to the base `PrismaClient` type. The Accelerate
// extension only adds opt-in features (e.g. `cacheStrategy`) we don't use, so
// the base type covers every query in the app and keeps a single exported type.
const prismaClientSingleton = (): PrismaClient => {
  if (isAccelerateUrl) {
    return new PrismaClient({ accelerateUrl: url, log: logLevels })
      .$extends(withAccelerate()) as unknown as PrismaClient;
  }
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: logLevels });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
