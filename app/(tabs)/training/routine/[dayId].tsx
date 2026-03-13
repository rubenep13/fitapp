import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseRepository } from "@/db/repositories/exerciseRepository";
import { useRoutineDays } from "@/hooks/useRoutineDays";
import type { Exercise } from "@/types";

export default function RoutineDayDetail() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { exercises, loading, refresh } = useExercises(dayId);
  const { routineDays } = useRoutineDays();
  const dayName = routineDays.find((d) => d.id === dayId)?.name ?? "Día";

  const [showForm, setShowForm] = useState(false);
  const [exName, setExName] = useState("");
  const [targetSets, setTargetSets] = useState("3");

  async function handleCreate() {
    if (!exName.trim()) return;
    await ExerciseRepository.create({
      routineDayId: dayId,
      name: exName.trim(),
      targetSets: parseInt(targetSets) || 3,
      order: exercises.length,
    });
    setExName("");
    setTargetSets("3");
    setShowForm(false);
    refresh();
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert("Eliminar ejercicio", `¿Eliminar "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await ExerciseRepository.delete(id);
          refresh();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: dayName }} />
      <View className="flex-1 bg-gray-950 px-4">
        <FlatList
          data={exercises}
          keyExtractor={(item: Exercise) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 10 }}
          renderItem={({ item }: { item: Exercise }) => (
            <View className="bg-gray-800 rounded-xl px-4 py-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-base font-medium">{item.name}</Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  {item.targetSets} series objetivo
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                className="ml-4 p-1"
              >
                <Text className="text-red-400 text-sm">Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center py-8">
                <Text className="text-gray-500">Sin ejercicios todavía</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            showForm ? (
              <View className="mt-4 bg-gray-800 rounded-xl p-4 gap-3">
                <TextInput
                  className="bg-gray-700 text-white rounded-lg px-4 py-3"
                  placeholder="Nombre del ejercicio"
                  placeholderTextColor="#9ca3af"
                  value={exName}
                  onChangeText={setExName}
                  autoFocus
                />
                <View className="flex-row items-center gap-3">
                  <Text className="text-gray-300 text-sm">Series objetivo:</Text>
                  <TextInput
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 w-16 text-center"
                    value={targetSets}
                    onChangeText={setTargetSets}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-700 py-3 rounded-lg items-center"
                    onPress={() => {
                      setShowForm(false);
                      setExName("");
                      setTargetSets("3");
                    }}
                  >
                    <Text className="text-gray-300">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                    onPress={handleCreate}
                  >
                    <Text className="text-white font-semibold">Añadir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="mt-4 border border-dashed border-gray-600 rounded-xl py-4 items-center"
                onPress={() => setShowForm(true)}
              >
                <Text className="text-gray-400">+ Añadir ejercicio</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </>
  );
}
