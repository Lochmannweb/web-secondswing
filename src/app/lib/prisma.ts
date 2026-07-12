import { PrismaClient } from "@prisma/client";

function ensureDatabaseEnv() {
  if (!process.env.DATABASE_URL && process.env.NEON_URL) {
    process.env.DATABASE_URL = process.env.NEON_URL;
  }

  if (!process.env.DIRECT_URL && process.env.NEON_URL) {
    process.env.DIRECT_URL = process.env.NEON_URL.replace("-pooler", "");
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
