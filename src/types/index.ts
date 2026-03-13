export type RoutineDay = {
  id: string;
  name: string;
  order: number;
  createdAt: string;
};

export type Exercise = {
  id: string;
  routineDayId: string;
  name: string;
  targetSets: number;
  order: number;
};

export type Session = {
  id: string;
  routineDayId: string;
  date: string;
  notes: string | null;
  durationMinutes: number | null;
};

export type WorkingSet = {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  notes: string | null;
};

export type ExerciseWithSets = Exercise & {
  sets: WorkingSet[];
};

export type SessionWithDetails = Session & {
  exercises: ExerciseWithSets[];
};
