import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
  const [targetSets, setTargetSets] = useState("4");

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
      <View className="flex-1 bg-zinc-950">
        <FlatList
          data={exercises}
          keyExtractor={(item: Exercise) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 8 }}
          renderItem={({ item }: { item: Exercise }) => (
            <View className="bg-zinc-900 rounded-2xl px-4 py-4 flex-row items-center">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">{item.name}</Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <View className="bg-orange-500/20 px-2 py-0.5 rounded-md">
                    <Text className="text-orange-400 text-xs font-semibold">
                      {item.targetSets} series
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                className="p-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={17} color="#71717a" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center py-12 gap-2">
                <Ionicons name="barbell-outline" size={32} color="#3f3f46" />
                <Text className="text-zinc-500 text-sm">Sin ejercicios todavía</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            showForm ? (
              <View className="mt-3 bg-zinc-900 rounded-2xl p-4 gap-3">
                <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                  Nuevo ejercicio
                </Text>
                <TextInput
                  className="bg-zinc-800 text-white rounded-xl px-4 py-3 text-base"
                  placeholder="Press banca, Sentadilla, Peso muerto…"
                  placeholderTextColor="#52525b"
                  value={exName}
                  onChangeText={setExName}
                  autoFocus
                />
                <View className="flex-row items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3">
                  <Text className="text-zinc-300 text-sm flex-1">Series objetivo</Text>
                  <TextInput
                    className="text-orange-400 font-bold text-base w-12 text-center"
                    value={targetSets}
                    onChangeText={setTargetSets}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-zinc-800 py-3 rounded-xl items-center"
                    onPress={() => {
                      setShowForm(false);
                      setExName("");
                      setTargetSets("3");
                    }}
                  >
                    <Text className="text-zinc-300 font-medium">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-orange-500 py-3 rounded-xl items-center"
                    onPress={handleCreate}
                  >
                    <Text className="text-white font-bold">Añadir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="mt-3 border border-dashed border-zinc-700 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                onPress={() => setShowForm(true)}
              >
                <Ionicons name="add" size={18} color="#52525b" />
                <Text className="text-zinc-500 font-medium">Añadir ejercicio</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </>
  );
}
