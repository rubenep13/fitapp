import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRoutineDays } from "@/hooks/useRoutineDays";
import type { RoutineDay } from "@/types";

export default function TrainingHome() {
  const { routineDays, loading } = useRoutineDays();

  return (
    <>
      <Stack.Screen
        options={{
          title: "FitApp",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/training/routine")}
              className="flex-row items-center gap-1 mr-1"
            >
              <Ionicons name="list-outline" size={16} color="#f97316" />
              <Text className="text-orange-400 text-sm font-medium">Rutinas</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-zinc-950">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#f97316" />
          </View>
        ) : routineDays.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8 gap-6">
            <View className="w-20 h-20 rounded-full bg-zinc-900 items-center justify-center">
              <Ionicons name="barbell-outline" size={40} color="#3f3f46" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-white text-xl font-bold text-center">
                Sin rutinas todavía
              </Text>
              <Text className="text-zinc-400 text-sm text-center leading-5">
                Crea tu primera rutina para empezar a registrar tus entrenamientos.
              </Text>
            </View>
            <TouchableOpacity
              className="bg-orange-500 px-8 py-4 rounded-2xl"
              onPress={() => router.push("/training/routine")}
            >
              <Text className="text-white font-bold text-base">Crear primera rutina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={routineDays}
            keyExtractor={(item: RoutineDay) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}
            ListHeaderComponent={
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 px-1">
                Selecciona tu entrenamiento
              </Text>
            }
            renderItem={({ item }: { item: RoutineDay }) => (
              <TouchableOpacity
                className="bg-zinc-900 rounded-2xl p-5 active:opacity-70 flex-row items-center"
                onPress={() => router.push(`/training/session/${item.id}`)}
              >
                <View className="w-1 h-12 rounded-full bg-orange-500 mr-4" />
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">{item.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5 uppercase tracking-wide">
                    Iniciar sesión
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#52525b" />
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <TouchableOpacity
                className="mt-6 flex-row items-center justify-center gap-2 py-3"
                onPress={() => router.push("/training/calendar")}
              >
                <Ionicons name="calendar-outline" size={15} color="#52525b" />
                <Text className="text-zinc-500 text-sm">Ver historial de sesiones</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </>
  );
}
