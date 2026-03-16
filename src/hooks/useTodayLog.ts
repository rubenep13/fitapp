import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useNutritionStore } from "@/stores/nutritionStore";
import { MealLogEntryRepository } from "@/db/repositories/mealLogEntryRepository";

function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useTodayLog() {
  const { todayLogs, setTodayLogs } = useNutritionStore();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MealLogEntryRepository.getByDate(todayStr());
      setTodayLogs(data);
    } finally {
      setLoading(false);
    }
  }, [setTodayLogs]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return { todayLogs, loading, refresh, today: todayStr() };
}
