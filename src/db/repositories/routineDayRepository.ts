import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { routineDay } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { RoutineDay } from "@/types";

export const RoutineDayRepository = {
  async getAll(): Promise<RoutineDay[]> {
    const rows = await db
      .select()
      .from(routineDay)
      .orderBy(asc(routineDay.order));
    return rows;
  },

  async create(data: { name: string; order: number }): Promise<RoutineDay> {
    const newDay: RoutineDay = {
      id: generateId(),
      name: data.name,
      order: data.order,
      createdAt: new Date().toISOString(),
    };
    await db.insert(routineDay).values(newDay);
    return newDay;
  },

  async update(
    id: string,
    data: Partial<Pick<RoutineDay, "name" | "order">>
  ): Promise<void> {
    await db.update(routineDay).set(data).where(eq(routineDay.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(routineDay).where(eq(routineDay.id, id));
  },
};
