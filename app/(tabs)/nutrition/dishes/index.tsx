import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { DishRepository } from "@/db/repositories/dishRepository";
import type { Dish } from "@/types";
import { useDishes } from "@/hooks/useDishes";

export default function DishesScreen() {
  const { dishes, refresh } = useDishes();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  async function handleCreate() {
    if (!newName.trim()) return;
    const d = await DishRepository.create(newName.trim());
    setNewName("");
    setShowForm(false);
    refresh();
    router.push(`/nutrition/dishes/${d.id}`);
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      "Eliminar plato",
      `¿Eliminar "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => { await DishRepository.delete(id); refresh(); },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Platos" }} />
      <View className="flex-1 bg-zinc-950">
        <FlatList
          data={dishes}
          keyExtractor={(item: Dish) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 8 }}
          renderItem={({ item }: { item: Dish }) => (
            <TouchableOpacity
              className="bg-zinc-900 rounded-2xl px-4 py-4 flex-row items-center"
              onPress={() => router.push(`/nutrition/dishes/${item.id}`)}
            >
              <View className="w-8 h-8 rounded-xl bg-zinc-800 items-center justify-center mr-3">
                <Ionicons name="restaurant-outline" size={16} color="#f97316" />
              </View>
              <Text className="text-white text-base font-semibold flex-1">{item.name}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                className="p-2 mr-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={17} color="#71717a" />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color="#3f3f46" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !showForm ? (
              <View className="items-center py-12 gap-2">
                <Ionicons name="restaurant-outline" size={32} color="#3f3f46" />
                <Text className="text-zinc-500 text-sm">Sin platos todavía</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            showForm ? (
              <View className="mt-3 bg-zinc-900 rounded-2xl p-4 gap-3">
                <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                  Nuevo plato
                </Text>
                <TextInput
                  className="bg-zinc-800 text-white rounded-xl px-4 py-3 text-base"
                  placeholder="Ej: Arroz con pollo"
                  placeholderTextColor="#52525b"
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-zinc-800 py-3 rounded-xl items-center"
                    onPress={() => { setShowForm(false); setNewName(""); }}
                  >
                    <Text className="text-zinc-300 font-medium">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-orange-500 py-3 rounded-xl items-center"
                    onPress={handleCreate}
                  >
                    <Text className="text-white font-bold">Crear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="mt-3 border border-dashed border-zinc-700 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                onPress={() => setShowForm(true)}
              >
                <Ionicons name="add" size={18} color="#52525b" />
                <Text className="text-zinc-500 font-medium">Añadir plato</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </>
  );
}
