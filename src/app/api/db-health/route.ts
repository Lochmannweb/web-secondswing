import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function hostHint(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid-url";
  }
}

export async function GET() {
  try {
    const count = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      productCount: count,
      hasNeonUrl: Boolean(process.env.NEON_URL),
      hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      neonHost: hostHint(process.env.NEON_URL),
      postgresPrismaHost: hostHint(process.env.POSTGRES_PRISMA_URL),
      databaseHost: hostHint(process.env.DATABASE_URL),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        hasNeonUrl: Boolean(process.env.NEON_URL),
        hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        neonHost: hostHint(process.env.NEON_URL),
        postgresPrismaHost: hostHint(process.env.POSTGRES_PRISMA_URL),
        databaseHost: hostHint(process.env.DATABASE_URL),
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
