import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTrainingStore, type ActiveSetInput } from "@/stores/trainingStore";
import { ExerciseRepository } from "@/db/repositories/exerciseRepository";
import { SessionRepository } from "@/db/repositories/sessionRepository";
import { WorkingSetRepository } from "@/db/repositories/workingSetRepository";
import { useRoutineDays } from "@/hooks/useRoutineDays";
import type { Exercise } from "@/types";

export default function SessionScreen() {
  const { routineDayId } = useLocalSearchParams<{ routineDayId: string }>();
  const navigation = useNavigation();
  const { routineDays } = useRoutineDays();
  const dayName = routineDays.find((d) => d.id === routineDayId)?.name ?? "Sesión";

  const {
    activeExercises,
    activeSets,
    lastSession,
    sessionStartTime,
    startSession,
    addSet,
    updateSet,
    removeSet,
    clearSession,
  } = useTrainingStore();

  const [loading, setLoading] = useState(true);
  const [expandedLastSession, setExpandedLastSession] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const exercises = await ExerciseRepository.getByRoutineDayId(routineDayId);
        const lastSess = await SessionRepository.getLastByRoutineDayId(routineDayId);
        startSession(routineDayId, exercises, lastSess);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [routineDayId]);

  // Back navigation guard
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (activeSets.length === 0) {
        clearSession();
        return;
      }
      e.preventDefault();
      Alert.alert(
        "¿Abandonar sesión?",
        "Se perderán las series no guardadas.",
        [
          { text: "Continuar", style: "cancel" },
          {
            text: "Abandonar",
            style: "destructive",
            onPress: () => {
              clearSession();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, activeSets.length, clearSession]);

  async function handleFinalize() {
    if (activeSets.length === 0) {
      Alert.alert("Sin series", "Registra al menos una serie antes de finalizar.");
      return;
    }
    try {
      const durationMinutes = sessionStartTime
        ? Math.round((Date.now() - sessionStartTime) / 60000)
        : null;
      const newSession = await SessionRepository.create({
        routineDayId,
        date: new Date().toISOString().split("T")[0],
        notes: null,
        durationMinutes,
      });
      await WorkingSetRepository.createMany(
        activeSets.map((s) => ({
          sessionId: newSession.id,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
          rpe: s.rpe,
          notes: s.notes,
        }))
      );
      clearSession();
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo guardar la sesión.");
    }
  }

  function handleAddSet(exercise: Exercise) {
    const exerciseSets = activeSets.filter((s) => s.exerciseId === exercise.id);
    const lastSet = exerciseSets[exerciseSets.length - 1];
    const lastSessionSets =
      lastSession?.exercises.find((e) => e.id === exercise.id)?.sets ?? [];
    const prevSet = lastSet ?? lastSessionSets[0];

    addSet({
      exerciseId: exercise.id,
      setNumber: exerciseSets.length + 1,
      reps: prevSet?.reps ?? 0,
      weightKg: prevSet?.weightKg ?? 0,
      rpe: null,
      notes: null,
    });
  }

  function toggleLastSession(exerciseId: string) {
    setExpandedLastSession((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: dayName }} />
      <KeyboardAvoidingView
        className="flex-1 bg-gray-950"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {activeExercises.map((exercise) => {
            const exerciseSets = activeSets.filter((s) => s.exerciseId === exercise.id);
            const lastSets =
              lastSession?.exercises.find((e) => e.id === exercise.id)?.sets ?? [];
            const isExpanded = expandedLastSession[exercise.id] ?? false;

            return (
              <View key={exercise.id} className="bg-gray-800 rounded-2xl overflow-hidden">
                {/* Exercise header */}
                <View className="px-4 pt-4 pb-2">
                  <Text className="text-white text-base font-semibold">{exercise.name}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {exercise.targetSets} series objetivo
                  </Text>
                </View>

                {/* Last session collapsible */}
                {lastSets.length > 0 && (
                  <View className="mx-4 mb-2 bg-gray-700 rounded-xl overflow-hidden">
                    <TouchableOpacity
                      className="px-3 py-2 flex-row items-center justify-between"
                      onPress={() => toggleLastSession(exercise.id)}
                    >
                      <Text className="text-gray-300 text-xs font-medium">
                        Última sesión
                        {lastSession?.date ? ` · ${lastSession.date}` : ""}
                      </Text>
                      <Text className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</Text>
                    </TouchableOpacity>
                    {isExpanded &&
                      lastSets.map((s) => (
                        <View key={s.id} className="px-3 pb-1.5 flex-row gap-3">
                          <Text className="text-gray-400 text-xs w-12">
                            Serie {s.setNumber}
                          </Text>
                          <Text className="text-gray-300 text-xs">
                            {s.reps} reps × {s.weightKg} kg
                          </Text>
                        </View>
                      ))}
                  </View>
                )}

                {/* Current sets */}
                <View className="px-4 pb-2 gap-2">
                  {/* Column headers */}
                  {exerciseSets.length > 0 && (
                    <View className="flex-row items-center gap-2 px-1">
                      <Text className="text-gray-500 text-xs w-8">#</Text>
                      <Text className="text-gray-500 text-xs flex-1 text-center">Reps</Text>
                      <Text className="text-gray-500 text-xs flex-1 text-center">Kg</Text>
                      <View className="w-8" />
                    </View>
                  )}
                  {exerciseSets.map((s) => (
                    <View
                      key={`${s.exerciseId}-${s.setNumber}`}
                      className="flex-row items-center gap-2"
                    >
                      <Text className="text-gray-400 text-sm w-8 text-center">
                        {s.setNumber}
                      </Text>
                      <TextInput
                        className="flex-1 bg-gray-700 text-white text-center rounded-lg py-2 text-sm"
                        value={s.reps > 0 ? String(s.reps) : ""}
                        placeholder="0"
                        placeholderTextColor="#6b7280"
                        keyboardType="number-pad"
                        onChangeText={(v) =>
                          updateSet(s.exerciseId, s.setNumber, {
                            reps: parseInt(v) || 0,
                          })
                        }
                      />
                      <TextInput
                        className="flex-1 bg-gray-700 text-white text-center rounded-lg py-2 text-sm"
                        value={s.weightKg > 0 ? String(s.weightKg) : ""}
                        placeholder="0"
                        placeholderTextColor="#6b7280"
                        keyboardType="decimal-pad"
                        onChangeText={(v) =>
                          updateSet(s.exerciseId, s.setNumber, {
                            weightKg: parseFloat(v) || 0,
                          })
                        }
                      />
                      <TouchableOpacity
                        className="w-8 items-center"
                        onPress={() => removeSet(s.exerciseId, s.setNumber)}
                      >
                        <Text className="text-red-400 text-lg">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    className="border border-dashed border-gray-600 rounded-lg py-2 items-center mt-1"
                    onPress={() => handleAddSet(exercise)}
                  >
                    <Text className="text-gray-400 text-sm">+ Serie</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {activeExercises.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-gray-500 text-base">
                Este día no tiene ejercicios.
              </Text>
              <TouchableOpacity
                className="mt-4"
                onPress={() => router.push(`/training/routine/${routineDayId}`)}
              >
                <Text className="text-blue-400">Añadir ejercicios →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Finalize button */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-gray-950 border-t border-gray-800">
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl py-4 items-center"
            onPress={handleFinalize}
          >
            <Text className="text-white font-bold text-base">Finalizar sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
