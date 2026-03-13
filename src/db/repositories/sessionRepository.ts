import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { session, workingSet, exercise } from "@/db/schema";
import { generateId } from "@/utils/uuid";
import type { Session, SessionWithDetails } from "@/types";

export const SessionRepository = {
  async create(data: Omit<Session, "id">): Promise<Session> {
    const newSession: Session = {
      id: generateId(),
      ...data,
    };
    await db.insert(session).values(newSession);
    return newSession;
  },

  async getAll(): Promise<Session[]> {
    const rows = await db
      .select()
      .from(session)
      .orderBy(desc(session.date));
    return rows;
  },

  async getByDate(date: string): Promise<Session[]> {
    const rows = await db
      .select()
      .from(session)
      .where(eq(session.date, date));
    return rows;
  },

  async getById(id: string): Promise<SessionWithDetails | null> {
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.id, id));

    if (sessions.length === 0) return null;
    const sess = sessions[0];

    const sets = await db
      .select()
      .from(workingSet)
      .where(eq(workingSet.sessionId, id));

    const exercises = await db
      .select()
      .from(exercise)
      .where(eq(exercise.routineDayId, sess.routineDayId))
      .orderBy(asc(exercise.order));

    const exercisesWithSets = exercises.map((ex) => ({
      ...ex,
      sets: sets
        .filter((s) => s.exerciseId === ex.id)
        .sort((a, b) => a.setNumber - b.setNumber),
    }));

    return {
      ...sess,
      exercises: exercisesWithSets,
    };
  },

  async getLastByRoutineDayId(routineDayId: string): Promise<SessionWithDetails | null> {
    const rows = await db
      .select()
      .from(session)
      .where(eq(session.routineDayId, routineDayId))
      .orderBy(desc(session.date));

    if (rows.length === 0) return null;
    return this.getById(rows[0].id);
  },

  async update(
    id: string,
    data: Partial<Pick<Session, "notes" | "durationMinutes">>
  ): Promise<void> {
    await db.update(session).set(data).where(eq(session.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(session).where(eq(session.id, id));
  },
};
