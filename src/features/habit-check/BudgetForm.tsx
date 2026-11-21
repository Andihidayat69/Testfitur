import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import {
  AppText,
  Button,
  Chip,
  Mascot,
  MoneyInput,
  Pad,
  Screen,
  StepHeader,
} from "@/components";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import { colors, layout } from "@/theme";

import {
  jajanBudgetQuickPicks,
  validateJajanBudget,
} from "./budget";

type Props = {
  headerLabel: string;
  onBack: () => void;
  initialValue?: number;
  initialName?: string;
  showName?: boolean;
  onSave: (jajanBudget: number, name?: string) => Promise<void>;
};

export function BudgetForm({
  headerLabel,
  onBack,
  initialValue,
  initialName = "",
  showName = false,
  onSave,
}: Props) {
  const [digits, setDigits] = useState(
    initialValue ? String(initialValue) : "",
  );
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = parseRupiahInput(digits);

  const save = async () => {
    const result = validateJajanBudget(digits);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const cleanName = name.trim();

    if (showName && !cleanName) {
      setNameError("Nama panggilan harus diisi, ya.");
      return;
    }

    if (cleanName.length > 30) {
      setNameError("Nama maksimal 30 karakter.");
      return;
    }

    setSaving(true);
    setSaveFailed(false);

    try {
      await onSave(result.value, cleanName || undefined);
    } catch {
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
      actions={
        <Button
          label="Simpan kuota"
          onPress={save}
          disabled={saving}
        />
      }
    >
      <Pad gap={16}>
        <View style={{ gap: 4, marginTop: 12 }}>
          {showName ? (
            <>
              <AppText variant="title">
                Siapa nama panggilanmu?
              </AppText>
              <AppText>
                Biar Jajan Tenang bisa menyapamu dengan lebih akrab.
              </AppText>

              <View style={styles.field}>
                <AppText variant="label">Nama panggilan</AppText>
                <TextInput
                  testID="profile-name-input"
                  accessibilityLabel="Nama panggilan"
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setNameError(null);
                  }}
                  placeholder="Contoh: Andi"
                  placeholderTextColor={colors.secondary}
                  maxLength={30}
                  autoCapitalize="words"
                  editable={!saving}
                  style={[
                    styles.textInput,
                    nameError && { borderColor: colors.dangerSoft },
                  ]}
                />
                {nameError ? (
                  <AppText
                    variant="caption"
                    color={colors.dangerSoft}
                  >
                    {nameError}
                  </AppText>
                ) : null}
              </View>
            </>
          ) : null}

          <AppText variant="title">
            Berapa kuota jajanmu sebulan?
          </AppText>
          <AppText>
            Buat jajan, nongkrong, dan belanja kecil. Bisa diubah kapan saja.
          </AppText>
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
          <View
            style={styles.failure}
            accessibilityLiveRegion="polite"
          >
            <Mascot pose="sedih" height={96} float={false} />
            <AppText style={{ flex: 1 }}>
              Maaf, belum berhasil disimpan. Coba lagi, ya.
            </AppText>
          </View>
        ) : null}
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  textInput: {
    height: layout.controlHeight,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: layout.radius,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  failure: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: layout.radius,
    backgroundColor: colors.card,
  },
});