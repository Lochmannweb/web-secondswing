#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./loadEnv.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv(root);

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", shell: true, cwd: root, env: process.env });
}

function getListeningPids(port) {
  try {
    const output = execSync(`netstat -ano | findstr ":${port} "`, {
      encoding: "utf8",
      shell: true,
    });
    const pids = new Set();
    for (const line of output.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    return [...pids];
  } catch {
    return [];
  }
}

function assertDevPortsFree() {
  const blocked = [
    ...getListeningPids(3000).map((pid) => ({ port: 3000, pid })),
    ...getListeningPids(5555).map((pid) => ({ port: 5555, pid })),
  ];

  if (!blocked.length) return;

  console.error("\nEn dev-server kører allerede:");
  for (const { port, pid } of blocked) {
    console.error(`  port ${port} → proces ${pid}`);
  }
  console.error("\nStop den først (Ctrl+C i terminalen), eller kør:");
  console.error(`  taskkill /PID ${blocked[0].pid} /F /T`);
  console.error("\nPrisma kan ikke opdatere query engine, mens Next.js/Studio kører.\n");
  process.exit(1);
}

function runPrismaGenerate() {
  const clientDir = resolve(root, "node_modules/.prisma/client");
  try {
    run("npx prisma generate");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("EPERM") && existsSync(clientDir)) {
      console.warn(
        "\nprisma generate fejlede (fil låst) — fortsætter med eksisterende Prisma client.\n"
      );
      return;
    }
    throw error;
  }
}

if (!process.env.DATABASE_URL && !process.env.NEON_URL) {
  console.error("\nNEON_URL mangler i .env.local");
  console.error("Neon Dashboard → Connection details → Pooled URI.\n");
  process.exit(1);
}

assertDevPortsFree();
run("node scripts/check-db.mjs");
runPrismaGenerate();

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
