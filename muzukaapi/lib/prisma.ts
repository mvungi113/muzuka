import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function normalizeConnectionString(url?: string): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    // Supabase poolers require pgbouncer=true for Prisma's driver adapter and
    // connection_limit=1 to avoid exhausting connections on serverless.
    if (u.hostname.includes('supabase')) {
      if (!u.searchParams.has('pgbouncer')) u.searchParams.set('pgbouncer', 'true');
      if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '1');
    }
    return u.toString();
  } catch {
    return url;
  }
}

function createPrismaClient() {
  const connectionString = normalizeConnectionString(process.env.DATABASE_URL) ?? '';
  const adapter = new PrismaPg({ connectionString, max: 1 });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
