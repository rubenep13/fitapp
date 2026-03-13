import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { SessionRepository } from "@/db/repositories/sessionRepository";
import type { Session } from "@/types";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
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

  useEffect(() => {
    SessionRepository.getAll().then((s) => {
      setSessions(s);
      setLoading(false);
    });
  }, []);

  const sessionDates = useMemo(
    () => new Set(sessions.map((s) => s.date)),
    [sessions]
  );

  const calendarDays = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  const selectedSessions = useMemo(
    () =>
      selectedDate ? sessions.filter((s) => s.date === selectedDate) : [],
    [sessions, selectedDate]
  );

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function handleDayPress(day: number) {
    const dateStr = `${year}-${padTwo(month + 1)}-${padTwo(day)}`;
    if (sessionDates.has(dateStr)) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr);
    }
  }

  const todayStr = `${now.getFullYear()}-${padTwo(now.getMonth() + 1)}-${padTwo(now.getDate())}`;

  return (
    <>
      <Stack.Screen options={{ title: "Historial" }} />
      <ScrollView className="flex-1 bg-gray-950">
        {/* Month navigation */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={prevMonth} className="p-2">
            <Text className="text-white text-xl">‹</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} className="p-2">
            <Text className="text-white text-xl">›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View className="flex-row px-4">
          {WEEKDAYS.map((d) => (
            <Text
              key={d}
              className="flex-1 text-center text-gray-500 text-xs pb-2"
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
                className="w-[14.28%] items-center py-2"
                onPress={() => handleDayPress(day)}
                disabled={!hasSession}
              >
                <View
                  className={`w-8 h-8 items-center justify-center rounded-full ${
                    isSelected
                      ? "bg-blue-600"
                      : isToday
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? "text-white font-bold"
                        : hasSession
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {day}
                  </Text>
                </View>
                {hasSession && !isSelected && (
                  <View className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sessions for selected date */}
        {selectedSessions.length > 0 && (
          <View className="px-4 mt-4 gap-3">
            <Text className="text-gray-400 text-sm font-medium">
              Sesiones del {selectedDate}
            </Text>
            {selectedSessions.map((s) => (
              <TouchableOpacity
                key={s.id}
                className="bg-gray-800 rounded-xl px-4 py-4"
                onPress={() => router.push(`/training/calendar/${s.id}`)}
              >
                <Text className="text-white font-medium">
                  Sesión de entrenamiento
                </Text>
                {s.durationMinutes != null && (
                  <Text className="text-gray-400 text-sm mt-1">
                    {s.durationMinutes} min
                  </Text>
                )}
                {s.notes && (
                  <Text className="text-gray-400 text-sm mt-1">{s.notes}</Text>
                )}
                <Text className="text-blue-400 text-sm mt-2">
                  Ver detalles →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && <ActivityIndicator className="mt-8" color="#60a5fa" />}

        <View className="h-8" />
      </ScrollView>
    </>
  );
}
