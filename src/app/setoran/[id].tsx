import { Redirect, router, useLocalSearchParams } from "expo-router";

import { useToast } from "@/components";
import { DepositForm } from "@/features/saving/DepositForm";
import { useSavings } from "@/state/savings-context";
import { useToday } from "@/state/use-today";

export default function EditDeposit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { goals, deposits, updateDeposit, removeDeposit } = useSavings();
  const toast = useToast();
  const deposit = deposits.find((d) => d.id === id);
  if (!deposit) return <Redirect href="/tabung" />;

  return (
    <DepositForm
      title="Ubah setoran"
      today={today}
      goals={goals}
      deposits={deposits}
      initialGoalId={deposit.goalId}
      initialAmount={deposit.amount}
      initialDate={deposit.occurredOn}
      hints={deposit.source === "pause" ? ["Diambil dari sisa jajanmu bulan ini."] : undefined}
      onBack={() => router.back()}
      onSave={async (input) => {
        const result = await updateDeposit(deposit.id, input);
        if (result.justReached) {
          router.replace({ pathname: "/setoran/tercapai", params: { goalId: input.goalId, then: "back" } });
          return;
        }
        toast("Setoran diperbarui.");
        router.back();
      }}
      onDelete={async () => {
        router.back();
        await removeDeposit(deposit.id);
        toast("Setoran dihapus.");
      }}
    />
  );
}
