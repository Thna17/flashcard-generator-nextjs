import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL. Add it to .env.local or .env.");
}

const useSsl = process.env.DATABASE_SSL !== "disable";
type PostgresClient = ReturnType<typeof postgres>;

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: PostgresClient;
};

const client =
  globalForDb.postgresClient ??
  postgres(databaseUrl, {
    ssl: useSsl ? "require" : undefined,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
