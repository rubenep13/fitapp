import { eq, like, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { food } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { Food } from "@/types";

export const FoodRepository = {
  async create(data: Omit<Food, "id" | "createdAt">): Promise<Food> {
    const newFood: Food = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    await db.insert(food).values(newFood);
    return newFood;
  },

  async getAll(query?: string): Promise<Food[]> {
    if (query && query.trim()) {
      return db
        .select()
        .from(food)
        .where(like(food.name, `%${query.trim()}%`))
        .orderBy(asc(food.name));
    }
    return db.select().from(food).orderBy(asc(food.name));
  },

  async getById(id: string): Promise<Food | null> {
    const rows = await db.select().from(food).where(eq(food.id, id));
    return rows[0] ?? null;
  },

  async update(id: string, data: Partial<Omit<Food, "id" | "createdAt">>): Promise<void> {
    await db.update(food).set(data).where(eq(food.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(food).where(eq(food.id, id));
  },
};
