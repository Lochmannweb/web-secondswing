import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

for (const f of [".env", ".env.local"]) {
  const p = resolve(f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const pg = await import("pg");
const client = new pg.default.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
await client.connect();

for (const table of ["products", "product_images", "favoriter", "chats", "messages", "profiles"]) {
  const { rows } = await client.query(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  console.log(`\n=== ${table} ===`);
  console.table(rows);
}

await client.end();
