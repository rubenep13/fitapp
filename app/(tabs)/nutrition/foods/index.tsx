import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useFoods } from "@/hooks/useFoods";
import { FoodRepository } from "@/db/repositories/foodRepository";
import type { Food } from "@/types";

export default function FoodsScreen() {
  const [query, setQuery] = useState("");
  const { foods, refresh } = useFoods(query);

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      "Eliminar alimento",
      `¿Eliminar "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await FoodRepository.delete(id);
            refresh(query);
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Alimentos",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/nutrition/foods/new")} className="pr-2">
              <Ionicons name="add" size={24} color="#f97316" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-zinc-950">
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 gap-2">
            <Ionicons name="search-outline" size={16} color="#52525b" />
            <TextInput
              className="flex-1 text-white py-3 text-base"
              placeholder="Buscar alimento…"
              placeholderTextColor="#52525b"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={16} color="#52525b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={foods}
          keyExtractor={(item: Food) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32, gap: 8 }}
          renderItem={({ item }: { item: Food }) => (
            <TouchableOpacity
              className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center"
              onPress={() => router.push(`/nutrition/foods/${item.id}`)}
            >
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">{item.name}</Text>
                <View className="flex-row gap-3 mt-1">
                  <Text className="text-orange-400 text-xs font-medium">{Math.round(item.caloriesPer100g)} kcal</Text>
                  <Text className="text-blue-400 text-xs">P {item.proteinPer100g.toFixed(1)}g</Text>
                  <Text className="text-yellow-400 text-xs">C {item.carbsPer100g.toFixed(1)}g</Text>
                  <Text className="text-pink-400 text-xs">G {item.fatPer100g.toFixed(1)}g</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                className="p-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={17} color="#71717a" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-12 gap-2">
              <Ionicons name="nutrition-outline" size={32} color="#3f3f46" />
              <Text className="text-zinc-500 text-sm">Sin alimentos todavía</Text>
            </View>
          }
        />
      </View>
    </>
  );
}
