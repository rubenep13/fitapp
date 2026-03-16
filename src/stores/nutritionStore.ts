import { create } from "zustand";
import type { MealLogWithEntries } from "@/types";

type NutritionState = {
  todayLogs: MealLogWithEntries[];
  setTodayLogs: (logs: MealLogWithEntries[]) => void;

  foods: import("@/types").Food[];
  setFoods: (foods: import("@/types").Food[]) => void;

  dishes: import("@/types").Dish[];
  setDishes: (dishes: import("@/types").Dish[]) => void;
};

export const useNutritionStore = create<NutritionState>((set) => ({
  todayLogs: [],
  setTodayLogs: (logs) => set({ todayLogs: logs }),

  foods: [],
  setFoods: (foods) => set({ foods }),

  dishes: [],
  setDishes: (dishes) => set({ dishes }),
}));
