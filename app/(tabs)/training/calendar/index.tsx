import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState, useMemo } from "react";
import { SessionRepository } from "@/db/repositories/sessionRepository";
import type { Session } from "@/types";

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

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      SessionRepository.getAll().then((s) => {
        setSessions(s);
        setLoading(false);
      });
    }, [])
  );

  const sessionDates = useMemo(
    () => new Set(sessions.map((s) => s.date)),
    [sessions]
  );

  const calendarDays = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  const selectedSessions = useMemo(
    () => (selectedDate ? sessions.filter((s) => s.date === selectedDate) : []),
    [sessions, selectedDate]
  );

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  function handleDayPress(day: number) {
    const dateStr = `${year}-${padTwo(month + 1)}-${padTwo(day)}`;
    if (sessionDates.has(dateStr)) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr);
    }
  }

  const todayStr = `${now.getFullYear()}-${padTwo(now.getMonth() + 1)}-${padTwo(now.getDate())}`;

  const monthSessionCount = sessions.filter(
    (s) => s.date.startsWith(`${year}-${padTwo(month + 1)}`)
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
            {monthSessionCount > 0 && (
              <Text className="text-orange-400 text-xs font-medium">
                {monthSessionCount} sesión{monthSessionCount !== 1 ? "es" : ""}
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
            <Text
              key={d}
              className="flex-1 text-center text-zinc-600 text-xs font-semibold pb-2"
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Days grid */}
        <View className="flex-row flex-wrap px-4">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <View key={`empty-${idx}`} className="w-[14.28%] py-2" />;
            }
            const dateStr = `${year}-${padTwo(month + 1)}-${padTwo(day)}`;
            const hasSession = sessionDates.has(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;

            return (
              <TouchableOpacity
                key={dateStr}
                className="w-[14.28%] items-center py-1.5"
                onPress={() => handleDayPress(day)}
                disabled={!hasSession}
              >
                <View
                  className={
                    isSelected
                      ? "w-9 h-9 items-center justify-center rounded-full bg-orange-500"
                      : isToday
                      ? "w-9 h-9 items-center justify-center rounded-full bg-zinc-800"
                      : "w-9 h-9 items-center justify-center"
                  }
                >
                  <Text
                    className={
                      isSelected
                        ? "text-white text-sm font-bold"
                        : hasSession
                        ? "text-white text-sm font-semibold"
                        : "text-zinc-600 text-sm"
                    }
                  >
                    {day}
                  </Text>
                </View>
                {hasSession && !isSelected && (
                  <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5" />
                )}
                {!hasSession && <View className="w-1.5 h-1.5 mt-0.5" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sessions for selected date */}
        {selectedSessions.length > 0 && (
          <View className="px-4 mt-4 gap-3">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
              {selectedDate}
            </Text>
            {selectedSessions.map((s) => (
              <TouchableOpacity
                key={s.id}
                className="bg-zinc-900 rounded-2xl px-4 py-4 flex-row items-center"
                onPress={() => router.push(`/training/calendar/${s.id}`)}
              >
                <View className="w-10 h-10 rounded-xl bg-orange-500/20 items-center justify-center mr-3">
                  <Ionicons name="barbell-outline" size={20} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">Sesión de entrenamiento</Text>
                  {s.durationMinutes != null && (
                    <Text className="text-zinc-400 text-sm mt-0.5">
                      {s.durationMinutes} min
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#52525b" />
              </TouchableOpacity>
            ))}
          </View>
        )}

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
