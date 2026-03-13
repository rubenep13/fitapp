import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const routineDay = sqliteTable("routine_day", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: text("created_at").notNull(),
});

export const exercise = sqliteTable("exercise", {
  id: text("id").primaryKey(),
  routineDayId: text("routine_day_id")
    .notNull()
    .references(() => routineDay.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetSets: integer("target_sets").notNull(),
  order: integer("order").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  routineDayId: text("routine_day_id")
    .notNull()
    .references(() => routineDay.id),
  date: text("date").notNull(),
  notes: text("notes"),
  durationMinutes: integer("duration_minutes"),
});

export const workingSet = sqliteTable("working_set", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => session.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weightKg: real("weight_kg").notNull(),
  rpe: integer("rpe"),
  notes: text("notes"),
});
