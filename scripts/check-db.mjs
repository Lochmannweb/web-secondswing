#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filename, override = false) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL mangler i .env.local");
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
  console.log("Database-forbindelse OK");
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\nDatabase-forbindelse fejlede:");
  console.error(message);
  console.error("\nGør dette i Supabase Dashboard → Project Settings → Database:");
  console.error("1. Reset database password (hvis du er i tvivl)");
  console.error("2. Kopiér Connection string → URI (Session pooler) til DIRECT_URL");
  console.error("3. Kopiér Connection string → URI (Transaction pooler) til DATABASE_URL");
  console.error("4. Erstat [YOUR-PASSWORD] — specialtegn skal URL-kodes (! → %21)");
  console.error("\nBrug hostnavnet fra dashboardet — gæt ikke region (aws-0-eu-central-1 osv.).\n");
  process.exit(1);
} finally {
  try {
    await client.end();
  } catch {}
}
