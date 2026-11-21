import { Redirect, router } from "expo-router";

import { BudgetForm } from "@/features/habit-check/BudgetForm";
import { useHabitCheck } from "@/features/habit-check/habit-check-context";
import { useProfile } from "@/state/profile-context";

export default function Budget() {
  const { habitType } = useHabitCheck();
  const { completeOnboarding } = useProfile();

  if (!habitType) return <Redirect href="/welcome" />;

  return (
    <BudgetForm
      headerLabel="Lengkapi profilmu"
      showName
      onBack={() => router.back()}
      onSave={async (jajanBudget, name) => {
        await completeOnboarding({
          name: name ?? "",
          habitType,
          jajanBudget,
        });

        router.replace({
          pathname: "/gajian",
          params: { from: "onboarding" },
        });
      }}
    />
  );
}