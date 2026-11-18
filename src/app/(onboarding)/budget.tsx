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
      headerLabel="Atur kuota jajan"
      onBack={() => router.back()}
      onSave={async (jajanBudget) => {
        await completeOnboarding({ habitType, jajanBudget });
        // Optional last step; onboarding is already complete (docs/specs/payday-reminder.md).
        router.replace({ pathname: "/gajian", params: { from: "onboarding" } });
      }}
    />
  );
}
