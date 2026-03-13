import { useEffect, useState, useCallback } from "react";
import { useTrainingStore } from "@/stores/trainingStore";
import { RoutineDayRepository } from "@/db/repositories/routineDayRepository";

export function useRoutineDays() {
  const { routineDays, setRoutineDays } = useTrainingStore();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const days = await RoutineDayRepository.getAll();
      setRoutineDays(days);
    } finally {
      setLoading(false);
    }
  }, [setRoutineDays]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { routineDays, loading, refresh };
}
