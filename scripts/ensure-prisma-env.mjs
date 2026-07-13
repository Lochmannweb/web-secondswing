/**
 * Sætter DATABASE_URL/DIRECT_URL før Prisma CLI (db push, generate, validate).
 * Bruges lokalt via setup-neon.mjs og i prisma.config.ts.
 */
export function ensurePrismaEnv() {
  if (process.env.NEON_URL) {
    process.env.DATABASE_URL = process.env.NEON_URL;
  } else if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  } else if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }

  if (process.env.NEON_DIRECT_URL) {
    process.env.DIRECT_URL = process.env.NEON_DIRECT_URL;
  } else if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
    process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
  } else if (!process.env.DIRECT_URL && process.env.DATABASE_URL?.includes("-pooler")) {
    process.env.DIRECT_URL = process.env.DATABASE_URL.replace("-pooler", "");
  }
}
