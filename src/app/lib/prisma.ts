import { PrismaClient } from "@prisma/client";

function ensureDatabaseEnv() {
  if (process.env.NEON_URL) {
    process.env.DATABASE_URL = process.env.NEON_URL;
    return;
  }

  if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  }
}

ensureDatabaseEnv();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
