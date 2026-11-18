import { Redirect, router, useLocalSearchParams } from "expo-router";

import { useToast } from "@/components";
import { GoalForm } from "@/features/saving/GoalForm";
import { useSavings } from "@/state/savings-context";

export default function EditGoal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, updateGoal } = useSavings();
  const toast = useToast();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return <Redirect href="/tabung" />;

  return (
    <GoalForm
      title="Ubah tujuan"
      submitLabel="Simpan"
      initial={goal}
      onBack={() => router.back()}
      onSave={async (input) => {
        await updateGoal(goal.id, input);
        toast("Tujuan diperbarui.");
        router.back();
      }}
    />
  );
}
