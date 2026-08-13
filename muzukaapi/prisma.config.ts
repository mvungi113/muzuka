import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async development() {
      return {
        url: process.env.DATABASE_URL!,
      };
    },
    async production() {
      return {
        url: process.env.DATABASE_URL!,
      };
    },
  },
  seed: 'npx tsx prisma/seed.ts',
} satisfies PrismaConfig;
