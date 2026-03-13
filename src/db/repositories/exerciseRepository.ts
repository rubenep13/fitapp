import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { exercise } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { Exercise } from "@/types";

export const ExerciseRepository = {
  async getByRoutineDayId(routineDayId: string): Promise<Exercise[]> {
    const rows = await db
      .select()
      .from(exercise)
      .where(eq(exercise.routineDayId, routineDayId))
      .orderBy(asc(exercise.order));
    return rows;
  },

  async create(data: Omit<Exercise, "id">): Promise<Exercise> {
    const newExercise: Exercise = {
      id: generateId(),
      ...data,
    };
    await db.insert(exercise).values(newExercise);
    return newExercise;
  },

  async update(
    id: string,
    data: Partial<Pick<Exercise, "name" | "targetSets" | "order">>
  ): Promise<void> {
    await db.update(exercise).set(data).where(eq(exercise.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(exercise).where(eq(exercise.id, id));
  },
};
