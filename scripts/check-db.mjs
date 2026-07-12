#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./loadEnv.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv(root);

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!url) {
  console.error("NEON_URL (eller DATABASE_URL) mangler i .env.local");
  process.exit(1);
}

let pg;
try {
  pg = await import("pg");
} catch {
  console.error("Kør: npm install pg --save-dev");
  process.exit(1);
}

const client = new pg.default.Client({ connectionString: url, connectionTimeoutMillis: 10000 });

try {
  await client.connect();
  await client.query("select 1");
  const host = url.includes("neon.tech") ? "Neon" : url.includes("supabase.com") ? "Supabase" : "Postgres";
  console.log(`Database-forbindelse OK (${host})`);
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\nDatabase-forbindelse fejlede:");
  console.error(message);
  console.error("\nNeon Dashboard → Connection details:");
  console.error("- NEON_URL = Pooled connection");
  console.error("- NEON_DIRECT_URL = Direct connection (valgfri; ellers udledes fra NEON_URL)");
  console.error("\nSupabase bruges kun til auth/profiles — ikke som NEON_URL.\n");
  process.exit(1);
} finally {
  try {
    await client.end();
  } catch {}
}
