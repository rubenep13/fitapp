export type RoutineDay = {
  id: string;
  name: string;
  order: number;
  createdAt: string;
};

export type Exercise = {
  id: string;
  routineDayId: string;
  name: string;
  targetSets: number;
  order: number;
};

export type Session = {
  id: string;
  routineDayId: string;
  date: string;
  notes: string | null;
  durationMinutes: number | null;
};

export type WorkingSet = {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  notes: string | null;
};

export type ExerciseWithSets = Exercise & {
  sets: WorkingSet[];
};

export type SessionWithDetails = Session & {
  exercises: ExerciseWithSets[];
};

// ── Nutrition ────────────────────────────────────────────────────────────────

export type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  createdAt: string;
};

export type Dish = {
  id: string;
  name: string;
  createdAt: string;
};

export type DishIngredient = {
  id: string;
  dishId: string;
  foodId: string;
  grams: number;
};

export type DishIngredientWithFood = DishIngredient & {
  food: Food;
};

export type DishWithIngredients = Dish & {
  ingredients: DishIngredientWithFood[];
};

export type MealTime = "breakfast" | "lunch" | "snack" | "dinner";

export type MealLog = {
  id: string;
  date: string;
  mealTime: MealTime;
};

export type MealLogEntry = {
  id: string;
  mealLogId: string;
  type: "dish" | "food";
  dishId: string | null;
  foodId: string | null;
  grams: number | null;
  scaleFactor: number | null;
};

export type MealLogEntryWithDetails = MealLogEntry & {
  dish: DishWithIngredients | null;
  food: Food | null;
};

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealLogWithEntries = MealLog & {
  entries: MealLogEntryWithDetails[];
};
