import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  if (!session) {
    return (
      <>
        <Stack.Screen options={{ title: "Sesión" }} />
        <View className="flex-1 bg-gray-950 items-center justify-center">
          <Text className="text-gray-400">Sesión no encontrada</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: dayName ?? "Sesión" }} />
      <ScrollView
        className="flex-1 bg-gray-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Session header */}
        <View className="bg-gray-800 rounded-2xl p-4 mb-4">
          <Text className="text-white font-semibold text-lg">
            {dayName ?? "Entrenamiento"}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">{session.date}</Text>
          {session.durationMinutes != null && (
            <Text className="text-gray-400 text-sm">
              {session.durationMinutes} min
            </Text>
          )}
          {session.notes && (
            <Text className="text-gray-300 text-sm mt-2 italic">
              {session.notes}
            </Text>
          )}
        </View>

        {/* Exercises */}
        <View className="gap-3">
          {session.exercises
            .filter((e) => e.sets.length > 0)
            .map((exercise) => (
              <View key={exercise.id} className="bg-gray-800 rounded-2xl p-4">
                <Text className="text-white font-semibold mb-3">
                  {exercise.name}
                </Text>
                <View className="gap-1.5">
                  {exercise.sets.map((s) => (
                    <View key={s.id} className="flex-row items-center gap-3">
                      <Text className="text-gray-500 text-sm w-14">
                        Serie {s.setNumber}
                      </Text>
                      <Text className="text-white text-sm font-medium">
                        {s.reps} reps
                      </Text>
                      <Text className="text-gray-400 text-sm">×</Text>
                      <Text className="text-white text-sm font-medium">
                        {s.weightKg} kg
                      </Text>
                      {s.rpe != null && (
                        <Text className="text-gray-400 text-xs ml-auto">
                          RPE {s.rpe}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
                {/* Volume summary */}
                <Text className="text-gray-500 text-xs mt-3">
                  Volumen total:{" "}
                  {exercise.sets
                    .reduce((acc, s) => acc + s.reps * s.weightKg, 0)
                    .toFixed(1)}{" "}
                  kg
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </>
  );
}
