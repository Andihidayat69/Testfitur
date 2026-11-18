import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Button, ChipOption, ConfirmDialog, DateField, MoneyInput, Pad, Screen, StepHeader } from "@/components";
import { colors } from "@/theme";

import { savedByGoal, sortGoals, validateDepositAmount, type Deposit, type SavingGoal } from "./goals";

type Props = {
  title: string;
  today: string;
  goals: SavingGoal[];
  deposits: Deposit[];
  initialGoalId?: string;
  initialAmount?: number;
  initialDate?: string;
  /** Extra lines under the amount (for example the Pause hints). */
  hints?: string[];
  onBack: () => void;
  onSave: (input: { goalId: string; amount: number; occurredOn: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
};

/** Add or edit a deposit (docs/specs/smart-saving.md). */
export function DepositForm(props: Props) {
  const { title, today, goals, deposits, hints, onBack, onSave, onDelete } = props;
  const ordered = sortGoals(goals, savedByGoal(deposits));
  const [goalId, setGoalId] = useState(props.initialGoalId ?? ordered[0]?.id ?? "");
  const [digits, setDigits] = useState(props.initialAmount ? String(props.initialAmount) : "");
  const [occurredOn, setOccurredOn] = useState(props.initialDate ?? today);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    const amount = validateDepositAmount(digits);
    if (!amount.ok) {
      setError(amount.error);
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      await onSave({ goalId, amount: amount.value, occurredOn: occurredOn > today ? today : occurredOn });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <Screen
      header={<StepHeader label={title} onBack={onBack} />}
      actions={
        <>
          <Button label="Simpan setoran" onPress={save} disabled={busy || !goalId} />
          {onDelete ? (
            <Button label="Hapus setoran" variant="secondary" onPress={() => setConfirmDelete(true)} disabled={busy} />
          ) : null}
        </>
      }
    >
      <Pad gap={20}>
        <View style={[styles.field, { marginTop: 12 }]}>
          <AppText variant="label">Masuk ke tujuan</AppText>
          {ordered.map((g) => (
            <ChipOption key={g.id} label={g.name} selected={goalId === g.id} onPress={() => setGoalId(g.id)} />
          ))}
        </View>

        <View style={styles.field}>
          <MoneyInput
            testID="deposit-amount-input"
            label="Nominal"
            value={digits}
            onChangeText={(v) => {
              setDigits(v);
              setError(null);
            }}
            placeholder="300.000"
            error={error}
            autoFocus={!props.initialAmount}
          />
          {hints?.map((hint) => (
            <AppText key={hint} variant="caption">
              {hint}
            </AppText>
          ))}
        </View>

        <DateField value={occurredOn} today={today} onChange={setOccurredOn} />

        {failed ? (
          <AppText color={colors.dangerSoft} accessibilityLiveRegion="polite">
            Maaf, belum berhasil disimpan. Coba lagi, ya.
          </AppText>
        ) : null}
      </Pad>

      <ConfirmDialog
        visible={confirmDelete}
        title="Hapus setoran ini?"
        confirmLabel="Hapus"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
});
