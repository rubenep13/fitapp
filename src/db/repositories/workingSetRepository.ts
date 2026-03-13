import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { workingSet } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { WorkingSet } from "@/types";

export const WorkingSetRepository = {
  async createMany(sets: Omit<WorkingSet, "id">[]): Promise<WorkingSet[]> {
    if (sets.length === 0) return [];
    const newSets: WorkingSet[] = sets.map((s) => ({
      id: generateId(),
      ...s,
    }));
    await db.insert(workingSet).values(newSets);
    return newSets;
  },

  async getBySessionId(sessionId: string): Promise<WorkingSet[]> {
    const rows = await db
      .select()
      .from(workingSet)
      .where(eq(workingSet.sessionId, sessionId));
    return rows;
  },
};
