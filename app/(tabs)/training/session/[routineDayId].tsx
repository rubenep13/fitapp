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
import { Ionicons } from "@expo/vector-icons";
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
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: dayName }} />
      <KeyboardAvoidingView
        className="flex-1 bg-zinc-950"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {activeExercises.map((exercise) => {
            const exerciseSets = activeSets.filter((s) => s.exerciseId === exercise.id);
            const lastSets =
              lastSession?.exercises.find((e) => e.id === exercise.id)?.sets ?? [];
            const isExpanded = expandedLastSession[exercise.id] ?? false;
            const progress = Math.min(exerciseSets.length / exercise.targetSets, 1);

            return (
              <View key={exercise.id} className="bg-zinc-900 rounded-2xl overflow-hidden">
                {/* Progress bar */}
                <View className="h-1 bg-zinc-800">
                  <View
                    className="h-1 bg-orange-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </View>

                {/* Exercise header */}
                <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-base font-bold">{exercise.name}</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                      {exerciseSets.length} / {exercise.targetSets} series
                    </Text>
                  </View>
                </View>

                {/* Last session collapsible */}
                {lastSets.length > 0 && (
                  <View className="mx-4 mb-2 bg-zinc-800 rounded-xl overflow-hidden">
                    <TouchableOpacity
                      className="px-3 py-2 flex-row items-center gap-2"
                      onPress={() => toggleLastSession(exercise.id)}
                    >
                      <Ionicons name="time-outline" size={13} color="#71717a" />
                      <Text className="text-zinc-400 text-xs font-medium flex-1">
                        Última sesión
                        {lastSession?.date ? ` · ${lastSession.date}` : ""}
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={13}
                        color="#52525b"
                      />
                    </TouchableOpacity>
                    {isExpanded &&
                      lastSets.map((s) => (
                        <View key={s.id} className="px-3 pb-1.5 flex-row gap-3">
                          <Text className="text-zinc-500 text-xs w-14">
                            Serie {s.setNumber}
                          </Text>
                          <Text className="text-zinc-300 text-xs">
                            {s.reps} reps × {s.weightKg} kg
                          </Text>
                        </View>
                      ))}
                  </View>
                )}

                {/* Current sets */}
                <View className="px-4 pb-3 gap-2">
                  {exerciseSets.length > 0 && (
                    <View className="flex-row items-center gap-2 px-1 mb-1">
                      <View className="w-8" />
                      <Text className="text-zinc-600 text-xs flex-1 text-center">REPS</Text>
                      <Text className="text-zinc-600 text-xs flex-1 text-center">KG</Text>
                      <View className="w-8" />
                    </View>
                  )}
                  {exerciseSets.map((s) => (
                    <View
                      key={`${s.exerciseId}-${s.setNumber}`}
                      className="flex-row items-center gap-2"
                    >
                      <View className="w-8 h-8 rounded-lg bg-orange-500/20 items-center justify-center">
                        <Text className="text-orange-400 text-xs font-bold">{s.setNumber}</Text>
                      </View>
                      <TextInput
                        className="flex-1 bg-zinc-800 text-white text-center rounded-xl py-2.5 text-sm font-semibold"
                        value={s.reps > 0 ? String(s.reps) : ""}
                        placeholder="0"
                        placeholderTextColor="#3f3f46"
                        keyboardType="number-pad"
                        onChangeText={(v) =>
                          updateSet(s.exerciseId, s.setNumber, {
                            reps: parseInt(v) || 0,
                          })
                        }
                      />
                      <TextInput
                        className="flex-1 bg-zinc-800 text-white text-center rounded-xl py-2.5 text-sm font-semibold"
                        value={s.weightKg > 0 ? String(s.weightKg) : ""}
                        placeholder="0"
                        placeholderTextColor="#3f3f46"
                        keyboardType="decimal-pad"
                        onChangeText={(v) =>
                          updateSet(s.exerciseId, s.setNumber, {
                            weightKg: parseFloat(v) || 0,
                          })
                        }
                      />
                      <TouchableOpacity
                        className="w-8 h-8 items-center justify-center"
                        onPress={() => removeSet(s.exerciseId, s.setNumber)}
                      >
                        <Ionicons name="close" size={18} color="#52525b" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    className="border border-dashed border-zinc-700 rounded-xl py-3 items-center flex-row justify-center gap-2 mt-1"
                    onPress={() => handleAddSet(exercise)}
                  >
                    <Ionicons name="add" size={16} color="#52525b" />
                    <Text className="text-zinc-500 text-sm font-medium">Añadir serie</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {activeExercises.length === 0 && (
            <View className="items-center py-16 gap-4">
              <Ionicons name="barbell-outline" size={40} color="#3f3f46" />
              <Text className="text-zinc-500 text-base text-center">
                Este día no tiene ejercicios.
              </Text>
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={() => router.push(`/training/routine/${routineDayId}`)}
              >
                <Text className="text-orange-400 font-medium">Añadir ejercicios</Text>
                <Ionicons name="arrow-forward" size={15} color="#f97316" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Finalize button */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-zinc-950 border-t border-zinc-900">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-zinc-500 text-xs">
              {activeSets.length} series registradas
            </Text>
            {sessionStartTime != null && (
              <Text className="text-zinc-500 text-xs">
                {Math.round((Date.now() - sessionStartTime) / 60000)} min
              </Text>
            )}
          </View>
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl py-4 items-center"
            onPress={handleFinalize}
          >
            <Text className="text-white font-bold text-base tracking-wide">
              Finalizar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
