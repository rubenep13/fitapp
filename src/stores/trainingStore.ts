import { create } from "zustand";
import type { RoutineDay, Exercise, SessionWithDetails } from "@/types";

export type ActiveSetInput = {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  notes: string | null;
};

type TrainingState = {
  routineDays: RoutineDay[];
  activeRoutineDayId: string | null;
  activeExercises: Exercise[];
  activeSets: ActiveSetInput[];
  lastSession: SessionWithDetails | null;
  sessionStartTime: number | null;

  setRoutineDays: (days: RoutineDay[]) => void;
  startSession: (
    routineDayId: string,
    exercises: Exercise[],
    lastSession: SessionWithDetails | null
  ) => void;
  addSet: (set: ActiveSetInput) => void;
  updateSet: (exerciseId: string, setNumber: number, data: Partial<ActiveSetInput>) => void;
  removeSet: (exerciseId: string, setNumber: number) => void;
  clearSession: () => void;
};

export const useTrainingStore = create<TrainingState>((set) => ({
  routineDays: [],
  activeRoutineDayId: null,
  activeExercises: [],
  activeSets: [],
  lastSession: null,
  sessionStartTime: null,

  setRoutineDays: (days) => set({ routineDays: days }),

  startSession: (routineDayId, exercises, lastSession) =>
    set({
      activeRoutineDayId: routineDayId,
      activeExercises: exercises,
      activeSets: [],
      lastSession,
      sessionStartTime: Date.now(),
    }),

  addSet: (newSet) =>
    set((state) => ({ activeSets: [...state.activeSets, newSet] })),

  updateSet: (exerciseId, setNumber, data) =>
    set((state) => ({
      activeSets: state.activeSets.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, ...data }
          : s
      ),
    })),

  removeSet: (exerciseId, setNumber) =>
    set((state) => ({
      activeSets: state.activeSets.filter(
        (s) => !(s.exerciseId === exerciseId && s.setNumber === setNumber)
      ),
    })),

  clearSession: () =>
    set({
      activeRoutineDayId: null,
      activeExercises: [],
      activeSets: [],
      lastSession: null,
      sessionStartTime: null,
    }),
}));
