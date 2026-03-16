import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTodayLog } from "@/hooks/useTodayLog";
import { calcEntryMacros, sumMacros } from "@/utils/macros";
import type { MealTime, Macros } from "@/types";

const MEAL_TIMES: { key: MealTime; label: string; icon: string }[] = [
  { key: "breakfast", label: "Desayuno", icon: "sunny-outline" },
  { key: "lunch", label: "Comida", icon: "restaurant-outline" },
  { key: "snack", label: "Merienda", icon: "cafe-outline" },
  { key: "dinner", label: "Cena", icon: "moon-outline" },
];

const GOAL_CALORIES = 2000;
const GOAL_PROTEIN = 150;
const GOAL_CARBS = 200;
const GOAL_FAT = 65;

export default function NutritionTodayScreen() {
  const { todayLogs, loading, today } = useTodayLog();

  const dayTotal = sumMacros(
    todayLogs.flatMap((log) => log.entries.map((e) => calcEntryMacros(e)))
  );

  const [y, m, d] = today.split("-");
  const dateLabel = new Date(today + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <Stack.Screen options={{ title: "Nutrición" }} />
      <ScrollView className="flex-1 bg-zinc-950">
        {/* Date header */}
        <View className="px-4 pt-5 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Hoy</Text>
            <Text className="text-white text-lg font-bold capitalize">{dateLabel}</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1 bg-zinc-900 rounded-xl px-3 py-2"
            onPress={() => router.push("/nutrition/log")}
          >
            <Ionicons name="calendar-outline" size={16} color="#a1a1aa" />
            <Text className="text-zinc-400 text-sm">Historial</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <View className="flex-row px-4 gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 bg-zinc-900 rounded-2xl px-3 py-3 flex-row items-center gap-2"
            onPress={() => router.push("/nutrition/foods")}
          >
            <Ionicons name="nutrition-outline" size={18} color="#f97316" />
            <Text className="text-zinc-300 text-sm font-medium">Alimentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-zinc-900 rounded-2xl px-3 py-3 flex-row items-center gap-2"
            onPress={() => router.push("/nutrition/dishes")}
          >
            <Ionicons name="restaurant-outline" size={18} color="#f97316" />
            <Text className="text-zinc-300 text-sm font-medium">Platos</Text>
          </TouchableOpacity>
        </View>

        {/* Totals card */}
        <View className="mx-4 bg-zinc-900 rounded-2xl px-4 py-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
              Resumen del día
            </Text>
            <Text className="text-orange-400 font-bold text-xl">
              {Math.round(dayTotal.calories)} kcal
            </Text>
          </View>
          <MacroBar label="Proteínas" value={dayTotal.protein} goal={GOAL_PROTEIN} color="bg-blue-500" unit="g" />
          <MacroBar label="Carbohidratos" value={dayTotal.carbs} goal={GOAL_CARBS} color="bg-yellow-500" unit="g" />
          <MacroBar label="Grasas" value={dayTotal.fat} goal={GOAL_FAT} color="bg-pink-500" unit="g" />
        </View>

        {/* Meal sections */}
        {MEAL_TIMES.map(({ key, label, icon }) => {
          const log = todayLogs.find((l) => l.mealTime === key);
          const entries = log?.entries ?? [];
          const mealTotal = sumMacros(entries.map((e) => calcEntryMacros(e)));

          return (
            <TouchableOpacity
              key={key}
              className="mx-4 mb-3 bg-zinc-900 rounded-2xl overflow-hidden"
              onPress={() => router.push(`/nutrition/log/${today}`)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center px-4 py-3 border-b border-zinc-800">
                <Ionicons name={icon as any} size={16} color="#f97316" />
                <Text className="text-white font-semibold ml-2 flex-1">{label}</Text>
                <View className="flex-row items-center gap-2">
                  {entries.length > 0 && (
                    <Text className="text-zinc-500 text-xs">
                      {Math.round(mealTotal.calories)} kcal
                    </Text>
                  )}
                  <Ionicons name="chevron-forward" size={14} color="#3f3f46" />
                </View>
              </View>

              {entries.length === 0 ? (
                <View className="px-4 py-3">
                  <Text className="text-zinc-600 text-sm">Sin registros</Text>
                </View>
              ) : (
                entries.slice(0, 3).map((entry) => {
                  const m = calcEntryMacros(entry);
                  const name =
                    entry.type === "dish"
                      ? entry.dish?.name ?? "Plato"
                      : entry.food?.name ?? "Alimento";
                  return (
                    <View key={entry.id} className="px-4 py-2 flex-row items-center">
                      <Text className="text-zinc-300 text-sm flex-1" numberOfLines={1}>
                        {name}
                      </Text>
                      <Text className="text-zinc-500 text-xs">
                        {Math.round(m.calories)} kcal
                      </Text>
                    </View>
                  );
                })
              )}

              {entries.length > 3 && (
                <View className="px-4 py-2">
                  <Text className="text-zinc-600 text-xs">+{entries.length - 3} más</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {loading && (
          <View className="mt-4 items-center">
            <ActivityIndicator color="#f97316" />
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </>
  );
}

function MacroBar({
  label,
  value,
  goal,
  color,
  unit,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min(value / goal, 1);
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-zinc-400 text-xs">{label}</Text>
        <Text className="text-zinc-400 text-xs">
          {value.toFixed(1)}{unit} / {goal}{unit}
        </Text>
      </View>
      <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <View
          className={`h-full ${color} rounded-full`}
          style={{ width: `${pct * 100}%` }}
        />
      </View>
    </View>
  );
}
