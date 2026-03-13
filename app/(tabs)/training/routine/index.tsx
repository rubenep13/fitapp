import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { useRoutineDays } from "@/hooks/useRoutineDays";
import { RoutineDayRepository } from "@/db/repositories/routineDayRepository";
import type { RoutineDay } from "@/types";

export default function RoutineList() {
  const { routineDays, loading, refresh } = useRoutineDays();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleCreate() {
    if (!newName.trim()) return;
    await RoutineDayRepository.create({ name: newName.trim(), order: routineDays.length });
    setNewName("");
    setShowForm(false);
    refresh();
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      "Eliminar día",
      `¿Eliminar "${name}"? Se perderán todos sus ejercicios y sesiones.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await RoutineDayRepository.delete(id);
            refresh();
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Mis rutinas" }} />
      <View className="flex-1 bg-gray-950 px-4">
        <FlatList
          data={routineDays}
          keyExtractor={(item: RoutineDay) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 10 }}
          renderItem={({ item }: { item: RoutineDay }) => (
            <TouchableOpacity
              className="bg-gray-800 rounded-xl px-4 py-4 flex-row items-center justify-between"
              onPress={() => router.push(`/training/routine/${item.id}`)}
            >
              <Text className="text-white text-base font-medium flex-1">{item.name}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                className="ml-4 p-1"
              >
                <Text className="text-red-400 text-sm">Eliminar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center py-8">
                <Text className="text-gray-500">Sin días de rutina todavía</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            showForm ? (
              <View className="mt-4 bg-gray-800 rounded-xl p-4 gap-3">
                <TextInput
                  className="bg-gray-700 text-white rounded-lg px-4 py-3"
                  placeholder="Nombre del día (ej. Push, Pull, Legs)"
                  placeholderTextColor="#9ca3af"
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-700 py-3 rounded-lg items-center"
                    onPress={() => {
                      setShowForm(false);
                      setNewName("");
                    }}
                  >
                    <Text className="text-gray-300">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                    onPress={handleCreate}
                  >
                    <Text className="text-white font-semibold">Crear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="mt-4 border border-dashed border-gray-600 rounded-xl py-4 items-center"
                onPress={() => setShowForm(true)}
              >
                <Text className="text-gray-400">+ Añadir día</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </>
  );
}
