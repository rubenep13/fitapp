import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FoodRepository } from "@/db/repositories/foodRepository";

export default function FoodFormScreen() {
  const { foodId } = useLocalSearchParams<{ foodId: string }>();
  const isNew = foodId === "new";

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      FoodRepository.getById(foodId).then((f) => {
        if (!f) return;
        setName(f.name);
        setCalories(String(f.caloriesPer100g));
        setProtein(String(f.proteinPer100g));
        setCarbs(String(f.carbsPer100g));
        setFat(String(f.fatPer100g));
      });
    }
  }, [foodId, isNew]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Nombre requerido");
      return;
    }
    const data = {
      name: name.trim(),
      caloriesPer100g: parseFloat(calories) || 0,
      proteinPer100g: parseFloat(protein) || 0,
      carbsPer100g: parseFloat(carbs) || 0,
      fatPer100g: parseFloat(fat) || 0,
    };
    setSaving(true);
    try {
      if (isNew) {
        await FoodRepository.create(data);
      } else {
        await FoodRepository.update(foodId, data);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: isNew ? "Nuevo alimento" : "Editar alimento" }} />
      <KeyboardAvoidingView
        className="flex-1 bg-zinc-950"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Pechuga de pollo" />
          <Field label="Calorías (por 100g)" value={calories} onChangeText={setCalories} placeholder="0" numeric />
          <Field label="Proteínas g (por 100g)" value={protein} onChangeText={setProtein} placeholder="0" numeric />
          <Field label="Carbohidratos g (por 100g)" value={carbs} onChangeText={setCarbs} placeholder="0" numeric />
          <Field label="Grasas g (por 100g)" value={fat} onChangeText={setFat} placeholder="0" numeric />

          <TouchableOpacity
            className="bg-orange-500 rounded-xl py-4 items-center mt-4"
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="text-white font-bold text-base">
              {saving ? "Guardando…" : "Guardar"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">{label}</Text>
      <TextInput
        className="bg-zinc-900 text-white rounded-xl px-4 py-3 text-base"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        keyboardType={numeric ? "decimal-pad" : "default"}
      />
    </View>
  );
}
