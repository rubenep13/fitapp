import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { mealLog } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { MealLog, MealTime } from "@/types";

export const MealLogRepository = {
  async getOrCreate(date: string, mealTime: MealTime): Promise<MealLog> {
    const existing = await db
      .select()
      .from(mealLog)
      .where(and(eq(mealLog.date, date), eq(mealLog.mealTime, mealTime)));

    if (existing.length > 0) return existing[0] as MealLog;

    const newLog: MealLog = { id: generateId(), date, mealTime };
    await db.insert(mealLog).values(newLog);
    return newLog;
  },

  async getByDate(date: string): Promise<MealLog[]> {
    const rows = await db.select().from(mealLog).where(eq(mealLog.date, date));
    return rows as MealLog[];
  },

  async getAllDates(): Promise<string[]> {
    const rows = await db.select({ date: mealLog.date }).from(mealLog);
    return [...new Set(rows.map((r) => r.date))];
  },
};
