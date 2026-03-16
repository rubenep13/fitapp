import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { SessionRepository } from "@/db/repositories/sessionRepository";
import { useRoutineDays } from "@/hooks/useRoutineDays";
import type { SessionWithDetails } from "@/types";

export default function SessionDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { routineDays } = useRoutineDays();
  const [session, setSession] = useState<SessionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SessionRepository.getById(sessionId).then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, [sessionId]);

  const dayName = routineDays.find((d) => d.id === session?.routineDayId)?.name;

  function handleDelete() {
    Alert.alert(
      "Eliminar sesión",
      "¿Seguro que quieres eliminar esta sesión? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await SessionRepository.delete(sessionId);
            router.back();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  if (!session) {
    return (
      <>
        <Stack.Screen options={{ title: "Sesión" }} />
        <View className="flex-1 bg-zinc-950 items-center justify-center">
          <Text className="text-zinc-400">Sesión no encontrada</Text>
        </View>
      </>
    );
  }

  const totalVolume = session.exercises.reduce(
    (acc, e) => acc + e.sets.reduce((a, s) => a + s.reps * s.weightKg, 0),
    0
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: dayName ?? "Sesión",
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-zinc-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
      >
        {/* Session header */}
        <View className="bg-zinc-900 rounded-2xl p-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-xl bg-orange-500/20 items-center justify-center">
              <Ionicons name="barbell-outline" size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">
                {dayName ?? "Entrenamiento"}
              </Text>
              <Text className="text-zinc-400 text-sm">{session.date}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            {session.durationMinutes != null && (
              <View className="flex-row items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-lg">
                <Ionicons name="time-outline" size={13} color="#71717a" />
                <Text className="text-zinc-300 text-sm font-medium">
                  {session.durationMinutes} min
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1.5 bg-orange-500/15 px-3 py-1.5 rounded-lg">
              <Ionicons name="flash-outline" size={13} color="#f97316" />
              <Text className="text-orange-400 text-sm font-semibold">
                {totalVolume.toFixed(0)} kg vol.
              </Text>
            </View>
          </View>
        </View>

        {/* Exercises */}
        {session.exercises
          .filter((e) => e.sets.length > 0)
          .map((exercise) => {
            const exVolume = exercise.sets.reduce(
              (acc, s) => acc + s.reps * s.weightKg,
              0
            );
            return (
              <View key={exercise.id} className="bg-zinc-900 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-bold text-base">{exercise.name}</Text>
                  <Text className="text-zinc-500 text-xs">
                    {exVolume.toFixed(0)} kg
                  </Text>
                </View>
                <View className="gap-1.5">
                  <View className="flex-row items-center gap-3 mb-1">
                    <Text className="text-zinc-700 text-xs w-14">SERIE</Text>
                    <Text className="text-zinc-700 text-xs flex-1">REPS</Text>
                    <Text className="text-zinc-700 text-xs flex-1">PESO</Text>
                    {exercise.sets.some((s) => s.rpe != null) && (
                      <Text className="text-zinc-700 text-xs w-12 text-right">RPE</Text>
                    )}
                  </View>
                  {exercise.sets.map((s) => (
                    <View key={s.id} className="flex-row items-center gap-3">
                      <View className="w-14">
                        <View className="w-6 h-6 rounded-md bg-orange-500/20 items-center justify-center">
                          <Text className="text-orange-400 text-xs font-bold">
                            {s.setNumber}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white text-sm font-semibold flex-1">
                        {s.reps} reps
                      </Text>
                      <Text className="text-white text-sm font-semibold flex-1">
                        {s.weightKg} kg
                      </Text>
                      {exercise.sets.some((s) => s.rpe != null) && (
                        <Text className="text-zinc-400 text-xs w-12 text-right">
                          {s.rpe != null ? `RPE ${s.rpe}` : "—"}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
      </ScrollView>
    </>
  );
}
