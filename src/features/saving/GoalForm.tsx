import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, MoneyInput, Pad, Screen, StepHeader } from "@/components";
import { colors, fontFamily, layout, maxFontSizeMultiplier } from "@/theme";

import {
  DEFAULT_GOAL_ICON,
  GOAL_NAME_MAX_LENGTH,
  goalIconCodes,
  goalIconLabels,
  validateGoalName,
  validateGoalTarget,
  type GoalIcon,
  type GoalInput,
  type SavingGoal,
} from "./goals";

type Props = {
  title: string;
  submitLabel: string;
  initial?: SavingGoal;
  intro?: string;
  onBack: () => void;
  onSave: (input: GoalInput) => Promise<void>;
};

/** Create or edit a saving goal (docs/specs/smart-saving.md). */
export function GoalForm({ title, submitLabel, initial, intro, onBack, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [digits, setDigits] = useState(initial ? String(initial.target) : "");
  const [icon, setIcon] = useState<GoalIcon>(initial?.icon ?? DEFAULT_GOAL_ICON);
  const [nameError, setNameError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const n = validateGoalName(name);
    const t = validateGoalTarget(digits);
    setNameError(n.ok ? null : n.error);
    setTargetError(t.ok ? null : t.error);
    if (!n.ok || !t.ok) return;
    setBusy(true);
    setFailed(false);
    try {
      await onSave({ name: n.value, target: t.value, icon });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <Screen
      header={<StepHeader label={title} onBack={onBack} />}
      actions={<Button label={submitLabel} onPress={save} disabled={busy} />}
    >
      <Pad gap={20}>
        {intro ? (
          <AppText variant="title" style={{ marginTop: 12 }}>
            {intro}
          </AppText>
        ) : null}
        <View style={[styles.field, !intro && { marginTop: 12 }]}>
          <AppText variant="label">Nama tujuan</AppText>
          <TextInput
            testID="goal-name-input"
            accessibilityLabel="Nama tujuan"
            value={name}
            onChangeText={(v) => {
              setName(v);
              setNameError(null);
            }}
            placeholder="HP baru"
            placeholderTextColor={colors.secondary}
            maxLength={GOAL_NAME_MAX_LENGTH}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            autoFocus={!initial}
            style={[styles.textInput, nameError && { borderColor: colors.dangerSoft }]}
          />
          {nameError ? (
            <AppText variant="caption" color={colors.dangerSoft}>
              {nameError}
            </AppText>
          ) : null}
        </View>

        <MoneyInput
          testID="goal-target-input"
          label="Target"
          value={digits}
          onChangeText={(v) => {
            setDigits(v);
            setTargetError(null);
          }}
          placeholder="4.000.000"
          error={targetError}
        />

        <View style={styles.field}>
          <AppText variant="label">Ikon</AppText>
          <View style={styles.icons}>
            {goalIconCodes.map((code) => {
              const selected = icon === code;
              return (
                <Pressable
                  key={code}
                  accessibilityRole="radio"
                  accessibilityLabel={goalIconLabels[code]}
                  accessibilityState={{ selected, checked: selected }}
                  onPress={() => setIcon(code)}
                  style={[styles.iconChip, selected && styles.iconChipOn]}
                >
                  <Feather name={code} size={22} color={selected ? colors.primary : colors.text} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {failed ? (
          <AppText color={colors.dangerSoft} accessibilityLiveRegion="polite">
            Maaf, belum berhasil disimpan. Coba lagi, ya.
          </AppText>
        ) : null}
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  icons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChipOn: { backgroundColor: colors.accent, borderColor: colors.primary },
  textInput: {
    height: layout.controlHeight,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: layout.radius,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text,
  },
});
