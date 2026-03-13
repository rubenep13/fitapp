import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useRoutineDays } from "@/hooks/useRoutineDays";
import type { RoutineDay } from "@/types";

export default function TrainingHome() {
  const { routineDays, loading } = useRoutineDays();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Entrenamiento",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/training/routine")}>
              <Text className="text-blue-400 text-sm mr-2">Rutinas</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-gray-950 px-4">
        {loading ? (
          <ActivityIndicator className="mt-8" color="#60a5fa" />
        ) : routineDays.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="text-gray-400 text-base text-center">
              Sin rutinas todavía.{"\n"}Crea tu primera rutina para empezar.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-xl"
              onPress={() => router.push("/training/routine")}
            >
              <Text className="text-white font-semibold">Crear rutina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={routineDays}
            keyExtractor={(item: RoutineDay) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 12 }}
            renderItem={({ item }: { item: RoutineDay }) => (
              <TouchableOpacity
                className="bg-gray-800 rounded-2xl p-5 active:opacity-70"
                onPress={() => router.push(`/training/session/${item.id}`)}
              >
                <Text className="text-white text-lg font-semibold">{item.name}</Text>
                <Text className="text-blue-400 text-sm mt-1">Iniciar sesión →</Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <TouchableOpacity
                className="mt-4 items-center py-3"
                onPress={() => router.push("/training/calendar")}
              >
                <Text className="text-gray-400 text-sm">Ver historial de sesiones</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </>
  );
}
