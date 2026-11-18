import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";

type Props = { label: string; onBack: () => void; step?: number; total?: number; right?: ReactNode };

/** Back button, optional step dots, and a label. step is 0-based. */
export function StepHeader({ label, onBack, step, total, right }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={onBack} style={styles.back} hitSlop={8}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.grow}>
        {step !== undefined && total ? (
          <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
              <View key={i} style={[styles.dot, i <= step && styles.dotOn]} />
            ))}
          </View>
        ) : null}
        <AppText variant="caption" numberOfLines={1}>
          {label}
        </AppText>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  back: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: layout.pill,
  },
  grow: { flex: 1, gap: 6 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { flex: 1, height: 6, borderRadius: layout.pill, backgroundColor: colors.accent },
  dotOn: { backgroundColor: colors.primary },
});
