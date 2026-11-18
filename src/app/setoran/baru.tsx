import { Redirect, router, useLocalSearchParams } from "expo-router";

import { useToast } from "@/components";
import { DepositForm } from "@/features/saving/DepositForm";
import { mainGoal, savedByGoal } from "@/features/saving/goals";
import { formatRupiah } from "@/lib/money";
import { useSavings } from "@/state/savings-context";
import { useToday } from "@/state/use-today";

type Params = { goalId?: string; pauseId?: string; amount?: string; mainGoal?: string };

/**
 * Add a deposit. From Pause ("Pindahkan ke tabungan") it carries `pauseId` and the price, and the
 * deposit reduces jajan left (docs/specs/smart-saving.md, Jajan Left and Deposits).
 */
export default function NewDeposit() {
  const params = useLocalSearchParams<Params>();
  const today = useToday();
  const { goals, deposits, addDeposit } = useSavings();
  const toast = useToast();
  const fromPause = Boolean(params.pauseId);

  // No goals yet: create one first, then come back here with the same parameters.
  if (goals.length === 0) {
    return <Redirect href={{ pathname: "/tujuan/baru", params: { next: "setoran", ...params } }} />;
  }

  const preselected =
    params.goalId && goals.some((g) => g.id === params.goalId)
      ? params.goalId
      : fromPause || params.mainGoal
        ? mainGoal(goals, savedByGoal(deposits))?.id
        : undefined;

  const finish = () => (fromPause ? router.dismissTo("/beranda") : router.back());

  return (
    <DepositForm
      title="Catat setoran"
      today={today}
      goals={goals}
      deposits={deposits}
      initialGoalId={preselected}
      initialAmount={params.amount ? Number(params.amount) : undefined}
      hints={fromPause ? ["Boleh ubah nominalnya.", "Diambil dari sisa jajanmu bulan ini."] : undefined}
      onBack={() => router.back()}
      onSave={async ({ goalId, amount, occurredOn }) => {
        const result = await addDeposit({
          goalId,
          amount,
          occurredOn,
          source: fromPause ? "pause" : "manual",
          pauseId: params.pauseId ?? null,
        });
        if (result.justReached) {
          router.replace({ pathname: "/setoran/tercapai", params: { goalId, then: fromPause ? "home" : "back" } });
          return;
        }
        toast(
          fromPause
            ? `${formatRupiah(amount)} pindah dari jajan ke tabungan. Keren!`
            : `${formatRupiah(amount)} masuk ke ${result.goal.name}.`,
        );
        finish();
      }}
    />
  );
}
