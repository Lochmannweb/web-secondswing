import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";
import { ensurePrismaEnv } from "./scripts/ensure-prisma-env.mjs";
import { loadProjectEnv } from "./scripts/loadEnv.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
loadProjectEnv(root);
ensurePrismaEnv();

function databaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    process.env.NEON_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    // prisma generate forbinder ikke til DB — placeholder til postinstall/CI
    "postgresql://placeholder@localhost:5432/placeholder"
  );
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl(),
  },
});
