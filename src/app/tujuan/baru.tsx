import { router, useLocalSearchParams } from "expo-router";

import { useToast } from "@/components";
import { GoalForm } from "@/features/saving/GoalForm";
import { useSavings } from "@/state/savings-context";

type Params = { next?: string; goalId?: string; pauseId?: string; amount?: string };

export default function NewGoal() {
  const params = useLocalSearchParams<Params>();
  const { createGoal } = useSavings();
  const toast = useToast();
  const continueToDeposit = params.next === "setoran";

  return (
    <GoalForm
      title="Tujuan baru"
      submitLabel="Buat tujuan"
      intro={continueToDeposit ? "Buat tujuan dulu, yuk." : undefined}
      onBack={() => router.back()}
      onSave={async (input) => {
        const goal = await createGoal(input);
        toast(`Tujuan "${goal.name}" dibuat.`);
        if (continueToDeposit) {
          router.replace({
            pathname: "/setoran/baru",
            params: { goalId: goal.id, ...(params.pauseId ? { pauseId: params.pauseId, amount: params.amount } : {}) },
          });
        } else {
          router.replace({ pathname: "/tujuan/[id]", params: { id: goal.id } });
        }
      }}
    />
  );
}
