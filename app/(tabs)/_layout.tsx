import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#111827" },
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tabs.Screen name="training" options={{ title: "Entrenamiento" }} />
    </Tabs>
  );
}
