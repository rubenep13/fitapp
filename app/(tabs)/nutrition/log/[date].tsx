import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { MealLogRepository } from "@/db/repositories/mealLogRepository";
import { MealLogEntryRepository } from "@/db/repositories/mealLogEntryRepository";
import { FoodRepository } from "@/db/repositories/foodRepository";
import { DishRepository } from "@/db/repositories/dishRepository";
import { calcEntryMacros, calcFoodMacros, calcDishMacros, sumMacros } from "@/utils/macros";
import type {
  MealLogWithEntries,
  MealLogEntryWithDetails,
  MealTime,
  Food,
  DishWithIngredients,
  Macros,
} from "@/types";

const MEAL_TIMES: { key: MealTime; label: string; icon: string }[] = [
  { key: "breakfast", label: "Desayuno", icon: "sunny-outline" },
  { key: "lunch", label: "Comida", icon: "restaurant-outline" },
  { key: "snack", label: "Merienda", icon: "cafe-outline" },
  { key: "dinner", label: "Cena", icon: "moon-outline" },
];

export default function DayLogScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [logs, setLogs] = useState<MealLogWithEntries[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMealTime, setActiveMealTime] = useState<MealTime>("breakfast");
  const [tab, setTab] = useState<"dishes" | "foods">("dishes");
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [allDishes, setAllDishes] = useState<DishWithIngredients[]>([]);
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Food | DishWithIngredients | null>(null);
  const [amountInput, setAmountInput] = useState("1");

  const load = useCallback(async () => {
    const data = await MealLogEntryRepository.getByDate(date);
    setLogs(data);
  }, [date]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function openAddModal(mealTime: MealTime) {
    setActiveMealTime(mealTime);
    setTab("dishes");
    setQuery("");
    setSelectedItem(null);
    setAmountInput("1");

    const foods = await FoodRepository.getAll();
    const dishIds = await DishRepository.getAll();
    const dishesWithIng = await Promise.all(
      dishIds.map((d) => DishRepository.getWithIngredients(d.id))
    );
    setAllFoods(foods);
    setAllDishes(dishesWithIng.filter(Boolean) as DishWithIngredients[]);
    setModalVisible(true);
  }

  async function handleAdd() {
    if (!selectedItem) return;
    const logEntry = await MealLogRepository.getOrCreate(date, activeMealTime);

    if (tab === "foods") {
      const food = selectedItem as Food;
      const grams = parseFloat(amountInput) || 100;
      await MealLogEntryRepository.create({
        mealLogId: logEntry.id,
        type: "food",
        dishId: null,
        foodId: food.id,
        grams,
        scaleFactor: null,
      });
    } else {
      const dish = selectedItem as DishWithIngredients;
      const scaleFactor = parseFloat(amountInput) || 1;
      await MealLogEntryRepository.create({
        mealLogId: logEntry.id,
        type: "dish",
        dishId: dish.id,
        foodId: null,
        grams: null,
        scaleFactor,
      });
    }

    setModalVisible(false);
    load();
  }

  async function handleDeleteEntry(id: string) {
    Alert.alert("Eliminar entrada", "¿Eliminar esta entrada?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => { await MealLogEntryRepository.delete(id); load(); },
      },
    ]);
  }

  const filteredFoods = allFoods.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredDishes = allDishes.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const dayTotal = sumMacros(
    logs.flatMap((log) => log.entries.map((e) => calcEntryMacros(e)))
  );

  const [y, m, d2] = date.split("-");
  const dateLabel = `${d2}/${m}/${y}`;

  return (
    <>
      <Stack.Screen options={{ title: dateLabel }} />
      <ScrollView className="flex-1 bg-zinc-950">
        {/* Day totals */}
        <View className="mx-4 mt-4 bg-zinc-900 rounded-2xl px-4 py-4 mb-4">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Total del día
          </Text>
          <View className="flex-row justify-between">
            <MacroItem label="Calorías" value={dayTotal.calories} unit="kcal" color="text-orange-400" />
            <MacroItem label="Proteínas" value={dayTotal.protein} unit="g" color="text-blue-400" />
            <MacroItem label="Carbos" value={dayTotal.carbs} unit="g" color="text-yellow-400" />
            <MacroItem label="Grasas" value={dayTotal.fat} unit="g" color="text-pink-400" />
          </View>
        </View>

        {/* Meal sections */}
        {MEAL_TIMES.map(({ key, label, icon }) => {
          const log = logs.find((l) => l.mealTime === key);
          const entries = log?.entries ?? [];
          const mealTotal = sumMacros(entries.map((e) => calcEntryMacros(e)));

          return (
            <View key={key} className="mx-4 mb-4 bg-zinc-900 rounded-2xl overflow-hidden">
              <View className="flex-row items-center px-4 py-3 border-b border-zinc-800">
                <Ionicons name={icon as any} size={16} color="#f97316" />
                <Text className="text-white font-semibold ml-2 flex-1">{label}</Text>
                {entries.length > 0 && (
                  <Text className="text-zinc-500 text-xs">
                    {Math.round(mealTotal.calories)} kcal
                  </Text>
                )}
              </View>

              {entries.map((entry) => {
                const m = calcEntryMacros(entry);
                const entryName =
                  entry.type === "dish" ? entry.dish?.name ?? "Plato" : entry.food?.name ?? "Alimento";
                const entryDetail =
                  entry.type === "dish"
                    ? `×${entry.scaleFactor ?? 1} ración`
                    : `${entry.grams ?? 0}g`;

                return (
                  <View key={entry.id} className="flex-row items-center px-4 py-3 border-b border-zinc-800/50">
                    <View className="flex-1">
                      <Text className="text-white text-sm font-medium">{entryName}</Text>
                      <Text className="text-zinc-500 text-xs mt-0.5">
                        {entryDetail} · {Math.round(m.calories)} kcal · P {m.protein.toFixed(1)}g
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntry(entry.id)}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#71717a" />
                    </TouchableOpacity>
                  </View>
                );
              })}

              <TouchableOpacity
                className="flex-row items-center justify-center py-3 gap-1"
                onPress={() => openAddModal(key)}
              >
                <Ionicons name="add" size={16} color="#52525b" />
                <Text className="text-zinc-500 text-sm">Añadir</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View className="h-8" />
      </ScrollView>

      {/* Add entry modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-zinc-950">
          <View className="flex-row items-center justify-between px-4 pt-6 pb-4 border-b border-zinc-800">
            <Text className="text-white text-lg font-bold">
              Añadir a {MEAL_TIMES.find((m) => m.key === activeMealTime)?.label}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row mx-4 mt-4 bg-zinc-900 rounded-xl p-1 mb-3">
            {(["dishes", "foods"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                className={`flex-1 py-2 rounded-lg items-center ${tab === t ? "bg-zinc-700" : ""}`}
                onPress={() => { setTab(t); setSelectedItem(null); setQuery(""); setAmountInput(t === "dishes" ? "1" : "100"); }}
              >
                <Text className={`font-medium text-sm ${tab === t ? "text-white" : "text-zinc-500"}`}>
                  {t === "dishes" ? "Platos" : "Alimentos"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!selectedItem ? (
            <>
              <View className="px-4 mb-3">
                <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 gap-2">
                  <Ionicons name="search-outline" size={16} color="#52525b" />
                  <TextInput
                    className="flex-1 text-white py-3 text-base"
                    placeholder="Buscar…"
                    placeholderTextColor="#52525b"
                    value={query}
                    onChangeText={setQuery}
                  />
                </View>
              </View>
              <FlatList
                data={tab === "foods" ? filteredFoods : filteredDishes}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                renderItem={({ item }: { item: any }) => {
                  const isFood = tab === "foods";
                  return (
                    <TouchableOpacity
                      className="bg-zinc-900 rounded-2xl px-4 py-3"
                      onPress={() => {
                        setSelectedItem(item);
                        setAmountInput(isFood ? "100" : "1");
                      }}
                    >
                      <Text className="text-white font-medium">{item.name}</Text>
                      {isFood ? (
                        <Text className="text-zinc-500 text-xs mt-0.5">
                          {Math.round(item.caloriesPer100g)} kcal/100g
                        </Text>
                      ) : (
                        <Text className="text-zinc-500 text-xs mt-0.5">
                          {Math.round(calcDishMacros(item, 1).calories)} kcal/ración
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          ) : (
            <View className="p-4 gap-4">
              <View className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center">
                <Text className="text-white font-semibold flex-1">{(selectedItem as any).name}</Text>
                <TouchableOpacity onPress={() => setSelectedItem(null)}>
                  <Ionicons name="close-circle-outline" size={18} color="#71717a" />
                </TouchableOpacity>
              </View>
              <View className="gap-1.5">
                <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                  {tab === "foods" ? "Cantidad (gramos)" : "Raciones (1 = 1 plato completo)"}
                </Text>
                <TextInput
                  className="bg-zinc-900 text-white rounded-xl px-4 py-3 text-base"
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
              {amountInput ? (
                <View className="bg-zinc-900 rounded-xl px-4 py-3 flex-row justify-between">
                  {(() => {
                    const amt = parseFloat(amountInput) || 0;
                    const m =
                      tab === "foods"
                        ? calcFoodMacros(selectedItem as Food, amt)
                        : calcDishMacros(selectedItem as DishWithIngredients, amt);
                    return (
                      <>
                        <Text className="text-orange-400 text-sm">{Math.round(m.calories)} kcal</Text>
                        <Text className="text-blue-400 text-sm">P {m.protein.toFixed(1)}g</Text>
                        <Text className="text-yellow-400 text-sm">C {m.carbs.toFixed(1)}g</Text>
                        <Text className="text-pink-400 text-sm">G {m.fat.toFixed(1)}g</Text>
                      </>
                    );
                  })()}
                </View>
              ) : null}
              <TouchableOpacity
                className="bg-orange-500 rounded-xl py-4 items-center"
                onPress={handleAdd}
              >
                <Text className="text-white font-bold text-base">Añadir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

function MacroItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View className="items-center">
      <Text className={`text-lg font-bold ${color}`}>{Math.round(value)}</Text>
      <Text className="text-zinc-500 text-xs">{unit}</Text>
      <Text className="text-zinc-600 text-xs">{label}</Text>
    </View>
  );
}
