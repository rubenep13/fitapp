import { useEffect, useState, useCallback } from "react";
import { useNutritionStore } from "@/stores/nutritionStore";
import { DishRepository } from "@/db/repositories/dishRepository";

export function useDishes() {
  const { dishes, setDishes } = useNutritionStore();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DishRepository.getAll();
      setDishes(data);
    } finally {
      setLoading(false);
    }
  }, [setDishes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { dishes, loading, refresh };
}
