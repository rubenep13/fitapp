import { useEffect, useState, useCallback } from "react";
import { ExerciseRepository } from "@/db/repositories/exerciseRepository";
import type { Exercise } from "@/types";

export function useExercises(routineDayId: string) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!routineDayId) return;
    setLoading(true);
    try {
      const data = await ExerciseRepository.getByRoutineDayId(routineDayId);
      setExercises(data);
    } finally {
      setLoading(false);
    }
  }, [routineDayId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { exercises, loading, refresh };
}
