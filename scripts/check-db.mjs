import { existsSync, readFileSync } from "node:fs";
import postgres from "postgres";

const ENV_FILES = [".env.local", ".env"];

for (const file of ENV_FILES) {
  if (!existsSync(file)) continue;

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing in .env.local or .env.");
  process.exit(1);
}

const useSsl = process.env.DATABASE_SSL !== "disable";
const sql = postgres(databaseUrl, {
  ssl: useSsl ? "require" : undefined,
  prepare: false,
  max: 1,
});

try {
  const [result] = await sql`
    select
      current_database() as database_name,
      current_user as current_user,
      version() as version
  `;

  console.log("Database connection successful.");
  console.log(`Database: ${result.database_name}`);
  console.log(`User: ${result.current_user}`);
  console.log(`Version: ${String(result.version).split(",")[0]}`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Database connection failed: ${message}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
