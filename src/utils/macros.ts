import type { Food, DishWithIngredients, MealLogEntryWithDetails, Macros } from "@/types";

export function calcFoodMacros(food: Food, grams: number): Macros {
  const ratio = grams / 100;
  return {
    calories: food.caloriesPer100g * ratio,
    protein: food.proteinPer100g * ratio,
    carbs: food.carbsPer100g * ratio,
    fat: food.fatPer100g * ratio,
  };
}

export function calcDishMacros(dish: DishWithIngredients, scaleFactor = 1): Macros {
  const base = dish.ingredients.reduce(
    (acc, ing) => {
      const m = calcFoodMacros(ing.food, ing.grams);
      return {
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: base.calories * scaleFactor,
    protein: base.protein * scaleFactor,
    carbs: base.carbs * scaleFactor,
    fat: base.fat * scaleFactor,
  };
}

export function calcEntryMacros(entry: MealLogEntryWithDetails): Macros {
  if (entry.type === "dish" && entry.dish) {
    return calcDishMacros(entry.dish, entry.scaleFactor ?? 1);
  }
  if (entry.type === "food" && entry.food) {
    return calcFoodMacros(entry.food, entry.grams ?? 0);
  }
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export function sumMacros(macrosList: Macros[]): Macros {
  return macrosList.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
