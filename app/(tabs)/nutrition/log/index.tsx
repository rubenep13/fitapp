import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useMemo } from "react";
import { MealLogRepository } from "@/db/repositories/mealLogRepository";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const days: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function padTwo(n: number) {
  return String(n).padStart(2, "0");
}

export default function NutritionLogScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [logDates, setLogDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      MealLogRepository.getAllDates().then((dates) => {
        setLogDates(new Set(dates));
        setLoading(false);
      });
    }, [])
  );

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const todayStr = `${now.getFullYear()}-${padTwo(now.getMonth() + 1)}-${padTwo(now.getDate())}`;

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const monthCount = [...logDates].filter((d) =>
    d.startsWith(`${year}-${padTwo(month + 1)}`)
  ).length;

  return (
    <>
      <Stack.Screen options={{ title: "Historial" }} />
      <ScrollView className="flex-1 bg-zinc-950">
        {/* Month navigation */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={prevMonth} className="p-2">
            <Ionicons name="chevron-back" size={20} color="#a1a1aa" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white text-lg font-bold">
              {MONTHS[month]} {year}
            </Text>
            {monthCount > 0 && (
              <Text className="text-orange-400 text-xs font-medium">
                {monthCount} día{monthCount !== 1 ? "s" : ""} registrados
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={nextMonth} className="p-2">
            <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View className="flex-row px-4 mb-1">
          {WEEKDAYS.map((d) => (
            <Text key={d} className="flex-1 text-center text-zinc-600 text-xs font-semibold pb-2">
              {d}
            </Text>
          ))}
        </View>

        {/* Days grid */}
        <View className="flex-row flex-wrap px-4">
          {calendarDays.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} className="w-[14.28%] py-2" />;
            const dateStr = `${year}-${padTwo(month + 1)}-${padTwo(day)}`;
            const hasLog = logDates.has(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <TouchableOpacity
                key={dateStr}
                className="w-[14.28%] items-center py-1.5"
                onPress={() => router.push(`/nutrition/log/${dateStr}`)}
              >
                <View
                  className={
                    isToday
                      ? "w-9 h-9 items-center justify-center rounded-full bg-zinc-800"
                      : "w-9 h-9 items-center justify-center"
                  }
                >
                  <Text
                    className={hasLog ? "text-white text-sm font-semibold" : "text-zinc-600 text-sm"}
                  >
                    {day}
                  </Text>
                </View>
                {hasLog ? (
                  <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5" />
                ) : (
                  <View className="w-1.5 h-1.5 mt-0.5" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && (
          <View className="mt-8 items-center">
            <ActivityIndicator color="#f97316" />
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </>
  );
}
