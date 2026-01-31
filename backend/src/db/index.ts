import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

declare const Bun: any;

const dbFile = Bun.env.DB_FILENAME || "local.db";
const sqlite = new Database(dbFile);
export const db = drizzle(sqlite, { schema });