#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", shell: true, cwd: root, env: process.env });
}

if (!process.env.DATABASE_URL) {
  console.error("\nDATABASE_URL mangler i .env.local");
  console.error("Opret en Postgres-database (fx Neon) og tilføj connection string.");
  console.error('Eksempel: DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"\n');
  process.exit(1);
}

run("npx prisma db push");
run("npx prisma db seed");
run("npx next dev");
