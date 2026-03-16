import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { dish, dishIngredient, food } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { Dish, DishWithIngredients } from "@/types";

export const DishRepository = {
  async create(name: string): Promise<Dish> {
    const newDish: Dish = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    await db.insert(dish).values(newDish);
    return newDish;
  },

  async getAll(): Promise<Dish[]> {
    return db.select().from(dish).orderBy(asc(dish.name));
  },

  async getById(id: string): Promise<Dish | null> {
    const rows = await db.select().from(dish).where(eq(dish.id, id));
    return rows[0] ?? null;
  },

  async getWithIngredients(id: string): Promise<DishWithIngredients | null> {
    const dishes = await db.select().from(dish).where(eq(dish.id, id));
    if (dishes.length === 0) return null;
    const theDish = dishes[0];

    const ingredients = await db
      .select()
      .from(dishIngredient)
      .where(eq(dishIngredient.dishId, id));

    const ingredientsWithFood = await Promise.all(
      ingredients.map(async (ing) => {
        const foods = await db.select().from(food).where(eq(food.id, ing.foodId));
        return { ...ing, food: foods[0] };
      })
    );

    return { ...theDish, ingredients: ingredientsWithFood };
  },

  async updateName(id: string, name: string): Promise<void> {
    await db.update(dish).set({ name }).where(eq(dish.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(dish).where(eq(dish.id, id));
  },
};
