#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
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
  console.error("Tilføj Supabase connection string fra Dashboard → Database.\n");
  process.exit(1);
}

run("node scripts/check-db.mjs");
run("npx prisma generate");

console.log("\nStarter Next.js (http://localhost:3000) og Prisma Studio (http://localhost:5555)\n");

const children = [
  spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true, cwd: root, env: process.env }),
  spawn("npx", ["prisma", "studio"], { stdio: "inherit", shell: true, cwd: root, env: process.env }),
];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) shutdown(code);
  });
}
