import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { mealLog, mealLogEntry, dish, dishIngredient, food } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { MealLogEntry, MealLogEntryWithDetails, MealLogWithEntries, MealTime } from "@/types";

export const MealLogEntryRepository = {
  async create(data: Omit<MealLogEntry, "id">): Promise<MealLogEntry> {
    const newEntry: MealLogEntry = { id: generateId(), ...data };
    await db.insert(mealLogEntry).values(newEntry);
    return newEntry;
  },

  async delete(id: string): Promise<void> {
    await db.delete(mealLogEntry).where(eq(mealLogEntry.id, id));
  },

  async getByDate(date: string): Promise<MealLogWithEntries[]> {
    const logs = await db.select().from(mealLog).where(eq(mealLog.date, date));

    const result: MealLogWithEntries[] = await Promise.all(
      logs.map(async (log) => {
        const entries = await db
          .select()
          .from(mealLogEntry)
          .where(eq(mealLogEntry.mealLogId, log.id));

        const entriesWithDetails: MealLogEntryWithDetails[] = await Promise.all(
          entries.map(async (entry) => {
            let dishData = null;
            let foodData = null;

            if (entry.type === "dish" && entry.dishId) {
              const dishes = await db.select().from(dish).where(eq(dish.id, entry.dishId));
              if (dishes.length > 0) {
                const ings = await db
                  .select()
                  .from(dishIngredient)
                  .where(eq(dishIngredient.dishId, entry.dishId));
                const ingsWithFood = await Promise.all(
                  ings.map(async (ing) => {
                    const foods = await db.select().from(food).where(eq(food.id, ing.foodId));
                    return { ...ing, food: foods[0] };
                  })
                );
                dishData = { ...dishes[0], ingredients: ingsWithFood };
              }
            }

            if (entry.type === "food" && entry.foodId) {
              const foods = await db.select().from(food).where(eq(food.id, entry.foodId));
              foodData = foods[0] ?? null;
            }

            return { ...entry, type: entry.type as "dish" | "food", dish: dishData, food: foodData };
          })
        );

        return { ...log, mealTime: log.mealTime as MealTime, entries: entriesWithDetails };
      })
    );

    return result;
  },
};
