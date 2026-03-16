import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";

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

// ── Nutrition ────────────────────────────────────────────────────────────────

export const food = sqliteTable("food", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  caloriesPer100g: real("calories_per_100g").notNull(),
  proteinPer100g: real("protein_per_100g").notNull(),
  carbsPer100g: real("carbs_per_100g").notNull(),
  fatPer100g: real("fat_per_100g").notNull(),
  createdAt: text("created_at").notNull(),
});

export const dish = sqliteTable("dish", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const dishIngredient = sqliteTable("dish_ingredient", {
  id: text("id").primaryKey(),
  dishId: text("dish_id")
    .notNull()
    .references(() => dish.id, { onDelete: "cascade" }),
  foodId: text("food_id")
    .notNull()
    .references(() => food.id, { onDelete: "cascade" }),
  grams: real("grams").notNull(),
});

export const mealLog = sqliteTable(
  "meal_log",
  {
    id: text("id").primaryKey(),
    date: text("date").notNull(),
    mealTime: text("meal_time").notNull(), // breakfast | lunch | snack | dinner
  },
  (t) => ({ uniqDateMeal: uniqueIndex("meal_log_date_meal_time").on(t.date, t.mealTime) })
);

export const mealLogEntry = sqliteTable("meal_log_entry", {
  id: text("id").primaryKey(),
  mealLogId: text("meal_log_id")
    .notNull()
    .references(() => mealLog.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'dish' | 'food'
  dishId: text("dish_id").references(() => dish.id),
  foodId: text("food_id").references(() => food.id),
  grams: real("grams"),
  scaleFactor: real("scale_factor"),
});
