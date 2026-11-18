import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Chip, Mascot, MoneyInput, Pad, Screen, StepHeader } from "@/components";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import { colors, layout } from "@/theme";

import { jajanBudgetQuickPicks, validateJajanBudget } from "./budget";

type Props = {
  headerLabel: string;
  onBack: () => void;
  initialValue?: number;
  /** Throws when saving fails; the form keeps the input and shows an error. */
  onSave: (jajanBudget: number) => Promise<void>;
};

/** The jajan budget step, shared by onboarding and Profil (docs/specs/financial-habit-check.md). */
export function BudgetForm({ headerLabel, onBack, initialValue, onSave }: Props) {
  const [digits, setDigits] = useState(initialValue ? String(initialValue) : "");
  const [error, setError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const current = parseRupiahInput(digits);

  const save = async () => {
    const result = validateJajanBudget(digits);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaving(true);
    setSaveFailed(false);
    try {
      await onSave(result.value);
    } catch {
      // Keep the input; never log the amount.
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const change = (next: string) => {
    setDigits(next);
    setError(null);
  };

  return (
    <Screen
      header={<StepHeader label={headerLabel} onBack={onBack} />}
      actions={<Button label="Simpan kuota" onPress={save} disabled={saving} />}
    >
      <Pad gap={16}>
        <View style={{ gap: 4, marginTop: 12 }}>
          <AppText variant="title">Berapa kuota jajanmu sebulan?</AppText>
          <AppText>Buat jajan, nongkrong, dan belanja kecil. Bisa diubah kapan saja.</AppText>
        </View>
        <MoneyInput
          testID="jajan-budget-input"
          label="Kuota jajan bulanan"
          value={digits}
          onChangeText={change}
          placeholder="800.000"
          error={error}
        />
        <View style={styles.chips}>
          {jajanBudgetQuickPicks.map((amount) => (
            <Chip
              key={amount}
              label={formatRupiah(amount)}
              selected={current === amount}
              onPress={() => change(String(amount))}
            />
          ))}
        </View>
        {saveFailed ? (
          <View style={styles.failure} accessibilityLiveRegion="polite">
            <Mascot pose="sedih" height={96} float={false} />
            <AppText style={{ flex: 1 }}>Maaf, belum berhasil disimpan. Coba lagi, ya.</AppText>
          </View>
        ) : null}
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  failure: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: layout.radius,
    backgroundColor: colors.card,
  },
});
