import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useEffect } from "react";
import { DishRepository } from "@/db/repositories/dishRepository";
import { DishIngredientRepository } from "@/db/repositories/dishIngredientRepository";
import { FoodRepository } from "@/db/repositories/foodRepository";
import { calcDishMacros, calcFoodMacros } from "@/utils/macros";
import type { DishWithIngredients, DishIngredientWithFood, Food } from "@/types";

export default function DishDetailScreen() {
  const { dishId } = useLocalSearchParams<{ dishId: string }>();
  const [dishData, setDishData] = useState<DishWithIngredients | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [foodQuery, setFoodQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [gramsInput, setGramsInput] = useState("");

  const load = useCallback(async () => {
    const d = await DishRepository.getWithIngredients(dishId);
    setDishData(d);
    if (d) setNameInput(d.name);
  }, [dishId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleSaveName() {
    if (!nameInput.trim() || !dishData) return;
    await DishRepository.updateName(dishId, nameInput.trim());
    setEditingName(false);
    load();
  }

  async function handleDeleteIngredient(id: string) {
    await DishIngredientRepository.delete(id);
    load();
  }

  async function openModal() {
    const foods = await FoodRepository.getAll();
    setAllFoods(foods);
    setFoodQuery("");
    setSelectedFood(null);
    setGramsInput("");
    setModalVisible(true);
  }

  async function handleAddIngredient() {
    if (!selectedFood || !gramsInput) return;
    const grams = parseFloat(gramsInput);
    if (isNaN(grams) || grams <= 0) return;
    await DishIngredientRepository.create({ dishId, foodId: selectedFood.id, grams });
    setModalVisible(false);
    load();
  }

  const filteredFoods = allFoods.filter((f) =>
    f.name.toLowerCase().includes(foodQuery.toLowerCase())
  );

  if (!dishData) return null;

  const totals = calcDishMacros(dishData, 1);

  return (
    <>
      <Stack.Screen options={{ title: dishData.name }} />
      <ScrollView className="flex-1 bg-zinc-950">
        {/* Name header */}
        <View className="px-4 pt-4 pb-2">
          {editingName ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-zinc-900 text-white rounded-xl px-4 py-3 text-lg font-bold"
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} className="p-2">
                <Ionicons name="checkmark" size={22} color="#f97316" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={() => setEditingName(true)}
            >
              <Text className="text-white text-xl font-bold flex-1">{dishData.name}</Text>
              <Ionicons name="pencil-outline" size={16} color="#52525b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Totals card */}
        <View className="mx-4 bg-zinc-900 rounded-2xl px-4 py-4 mb-4">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Totales (1 ración)
          </Text>
          <View className="flex-row justify-between">
            <MacroItem label="Calorías" value={totals.calories} unit="kcal" color="text-orange-400" />
            <MacroItem label="Proteínas" value={totals.protein} unit="g" color="text-blue-400" />
            <MacroItem label="Carbos" value={totals.carbs} unit="g" color="text-yellow-400" />
            <MacroItem label="Grasas" value={totals.fat} unit="g" color="text-pink-400" />
          </View>
        </View>

        {/* Ingredients */}
        <View className="px-4 gap-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Ingredientes
          </Text>
          {dishData.ingredients.map((ing) => {
            const m = calcFoodMacros(ing.food, ing.grams);
            return (
              <View key={ing.id} className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center">
                <View className="flex-1">
                  <Text className="text-white font-medium">{ing.food.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">
                    {ing.grams}g · {Math.round(m.calories)} kcal · P {m.protein.toFixed(1)}g
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteIngredient(ing.id)}
                  className="p-2"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#71717a" />
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity
            className="border border-dashed border-zinc-700 rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-1"
            onPress={openModal}
          >
            <Ionicons name="add" size={18} color="#52525b" />
            <Text className="text-zinc-500 font-medium">Añadir ingrediente</Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Add ingredient modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-zinc-950">
          <View className="flex-row items-center justify-between px-4 pt-6 pb-4 border-b border-zinc-800">
            <Text className="text-white text-lg font-bold">Añadir ingrediente</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {!selectedFood ? (
            <>
              <View className="px-4 py-3">
                <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 gap-2">
                  <Ionicons name="search-outline" size={16} color="#52525b" />
                  <TextInput
                    className="flex-1 text-white py-3 text-base"
                    placeholder="Buscar alimento…"
                    placeholderTextColor="#52525b"
                    value={foodQuery}
                    onChangeText={setFoodQuery}
                  />
                </View>
              </View>
              <FlatList
                data={filteredFoods}
                keyExtractor={(f) => f.id}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="bg-zinc-900 rounded-2xl px-4 py-3"
                    onPress={() => setSelectedFood(item)}
                  >
                    <Text className="text-white font-medium">{item.name}</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                      {Math.round(item.caloriesPer100g)} kcal/100g · P {item.proteinPer100g.toFixed(1)}g
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <View className="p-4 gap-4">
              <View className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center">
                <Text className="text-white font-semibold flex-1">{selectedFood.name}</Text>
                <TouchableOpacity onPress={() => setSelectedFood(null)}>
                  <Ionicons name="close-circle-outline" size={18} color="#71717a" />
                </TouchableOpacity>
              </View>
              <View className="gap-1.5">
                <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                  Cantidad (gramos)
                </Text>
                <TextInput
                  className="bg-zinc-900 text-white rounded-xl px-4 py-3 text-base"
                  value={gramsInput}
                  onChangeText={setGramsInput}
                  placeholder="100"
                  placeholderTextColor="#52525b"
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
              {gramsInput ? (
                <View className="bg-zinc-900 rounded-xl px-4 py-3 flex-row justify-between">
                  {(() => {
                    const g = parseFloat(gramsInput) || 0;
                    const m = calcFoodMacros(selectedFood, g);
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
                onPress={handleAddIngredient}
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
