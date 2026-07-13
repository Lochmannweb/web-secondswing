/**
 * Sætter DATABASE_URL/DIRECT_URL før Prisma CLI (db push, generate, validate).
 * Bruges lokalt via setup-neon.mjs og i prisma.config.ts.
 */
export function normalizeDatabaseUrl(url) {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    // channel_binding=require fejler ofte på Vercel/serverless
    parsed.searchParams.delete("channel_binding");
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    if (parsed.hostname.includes("-pooler") && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    return parsed.toString();
  } catch {
    return url
      .replace(/([?&])channel_binding=require(?=&|$)/g, "$1")
      .replace(/[?&]$/, "");
  }
}

export function ensurePrismaEnv() {
  if (process.env.NEON_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.NEON_URL);
  } else if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.POSTGRES_PRISMA_URL);
  } else if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.POSTGRES_URL);
  } else if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
  }

  if (process.env.NEON_DIRECT_URL) {
    process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.NEON_DIRECT_URL);
  } else if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
    process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.POSTGRES_URL_NON_POOLING);
  } else if (!process.env.DIRECT_URL && process.env.DATABASE_URL?.includes("-pooler")) {
    process.env.DIRECT_URL = normalizeDatabaseUrl(
      process.env.DATABASE_URL.replace("-pooler", "")
    );
  }
}
