import { useEffect, useState, useCallback } from "react";
import { useNutritionStore } from "@/stores/nutritionStore";
import { FoodRepository } from "@/db/repositories/foodRepository";

export function useFoods(query?: string) {
  const { foods, setFoods } = useNutritionStore();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const data = await FoodRepository.getAll(q);
      setFoods(data);
    } finally {
      setLoading(false);
    }
  }, [setFoods]);

  useEffect(() => {
    refresh(query);
  }, [query, refresh]);

  return { foods, loading, refresh };
}
