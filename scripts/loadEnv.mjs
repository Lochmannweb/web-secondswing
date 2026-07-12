import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Loader .env + .env.local og mapper NEON_URL → DATABASE_URL/DIRECT_URL for Prisma.
 */
export function loadProjectEnv(root) {
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

  if (process.env.NEON_URL) {
    process.env.DATABASE_URL = process.env.NEON_URL;
  }

  if (process.env.NEON_DIRECT_URL) {
    process.env.DIRECT_URL = process.env.NEON_DIRECT_URL;
  } else if (process.env.NEON_URL) {
    process.env.DIRECT_URL = process.env.NEON_URL.replace("-pooler", "");
  }
}
