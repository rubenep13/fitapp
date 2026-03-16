import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { dishIngredient } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { DishIngredient } from "@/types";

export const DishIngredientRepository = {
  async create(data: Omit<DishIngredient, "id">): Promise<DishIngredient> {
    const newIng: DishIngredient = { id: generateId(), ...data };
    await db.insert(dishIngredient).values(newIng);
    return newIng;
  },

  async update(id: string, grams: number): Promise<void> {
    await db.update(dishIngredient).set({ grams }).where(eq(dishIngredient.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(dishIngredient).where(eq(dishIngredient.id, id));
  },
};
