import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";

export type QuizOptionState = "idle" | "correct" | "wrong" | "dim";

type Props = { label: string; state: QuizOptionState; onPress: () => void; disabled?: boolean };

/**
 * Quiz answer (design system: "Chip option / quiz answer"). After answering, the right one uses
 * `success` and a wrong pick uses `danger-soft`; each also has an icon, never color alone.
 */
export function QuizOption({ label, state, onPress, disabled = false }: Props) {
  const hint = state === "correct" ? ", jawaban yang betul" : state === "wrong" ? ", jawabanmu" : "";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${hint}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.option, stateStyle[state], state === "dim" && styles.dim]}
    >
      <AppText style={styles.label}>{label}</AppText>
      {state === "correct" ? <Feather name="check-circle" size={22} color={colors.success} /> : null}
      {state === "wrong" ? <Feather name="info" size={22} color={colors.dangerSoft} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: layout.touchTarget,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: { flex: 1 },
  dim: { opacity: 0.6 },
});

const stateStyle = StyleSheet.create({
  idle: { backgroundColor: colors.white, borderColor: colors.accent },
  dim: { backgroundColor: colors.white, borderColor: colors.accent },
  correct: { backgroundColor: colors.white, borderColor: colors.success },
  wrong: { backgroundColor: colors.white, borderColor: colors.dangerSoft },
});
