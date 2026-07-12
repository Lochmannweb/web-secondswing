#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./loadEnv.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv(root);

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", shell: true, cwd: root, env: process.env });
}

if (!process.env.DATABASE_URL && !process.env.NEON_URL) {
  console.error("\nNEON_URL mangler i .env.local");
  console.error("Neon Dashboard → Connection details → Pooled URI.\n");
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
