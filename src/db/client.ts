import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expo = openDatabaseSync("fitapp.db", { enableChangeListener: true });
export const db = drizzle(expo, { schema });

export function initDatabase() {
  expo.execSync(`CREATE TABLE IF NOT EXISTS routine_day (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, "order" INTEGER NOT NULL, created_at TEXT NOT NULL)`);
  expo.execSync(`CREATE TABLE IF NOT EXISTS exercise (id TEXT PRIMARY KEY NOT NULL, routine_day_id TEXT NOT NULL REFERENCES routine_day(id) ON DELETE CASCADE, name TEXT NOT NULL, target_sets INTEGER NOT NULL, "order" INTEGER NOT NULL)`);
  expo.execSync(`CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY NOT NULL, routine_day_id TEXT NOT NULL REFERENCES routine_day(id), date TEXT NOT NULL, notes TEXT, duration_minutes INTEGER)`);
  expo.execSync(`CREATE TABLE IF NOT EXISTS working_set (id TEXT PRIMARY KEY NOT NULL, session_id TEXT NOT NULL REFERENCES session(id) ON DELETE CASCADE, exercise_id TEXT NOT NULL REFERENCES exercise(id), set_number INTEGER NOT NULL, reps INTEGER NOT NULL, weight_kg REAL NOT NULL, rpe INTEGER, notes TEXT)`);
}
