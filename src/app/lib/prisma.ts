import { PrismaClient } from "@prisma/client";

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
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

function ensureDatabaseEnv() {
  if (process.env.NEON_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.NEON_URL);
    return;
  }

  if (process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.POSTGRES_PRISMA_URL);
    return;
  }

  if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.POSTGRES_URL);
    return;
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("supabase.com")) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
  }
}

ensureDatabaseEnv();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Vigtigt på Vercel/serverless: genbrug én PrismaClient (ellers åbner hver request ny DB-forbindelse).
globalForPrisma.prisma = prisma;
