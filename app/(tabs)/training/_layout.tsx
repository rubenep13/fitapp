import { Stack } from "expo-router";

export default function TrainingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#f9fafb",
        headerTitleStyle: { fontWeight: "600" },
      }}
    />
  );
}
