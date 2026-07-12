#!/usr/bin/env node
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./loadEnv.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv(root);

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", shell: true, cwd: root, env: process.env });
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!url) {
  console.error("\nNEON_URL (eller DATABASE_URL) mangler i .env.local");
  console.error("Neon Dashboard → Connection details → Pooled connection string.\n");
  process.exit(1);
}

if (url.includes("supabase.com")) {
  console.warn("\n⚠ DATABASE_URL peger stadig på Supabase.");
  console.warn("Brug NEON_URL med Neon connection string.\n");
}

run("node scripts/check-db.mjs");
run("npx prisma db push --accept-data-loss");

console.log("\n✓ Neon database klar (products, favoriter, chats, messages, product_images).");
console.log("  Supabase beholder: auth, profiles, storage.");
console.log("  Du kan nu slette indholdstabeller i Supabase Dashboard (testdata).\n");
