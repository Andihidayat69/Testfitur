import { StyleSheet, View } from "react-native";

import { colors, layout } from "@/theme";

type Props = { value: number; tone?: "default" | "danger"; /** White on Ice Blue surfaces such as heroes. */ onTinted?: boolean };

/** value is 0..1. */
export function ProgressBar({ value, tone = "default", onTinted = false }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      style={[styles.track, onTinted && { backgroundColor: colors.white }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
    >
      <View
        testID="progress-fill"
        style={[styles.fill, { width: `${pct}%`, backgroundColor: tone === "danger" ? colors.dangerSoft : colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: layout.pill, backgroundColor: colors.bg1, overflow: "hidden" },
  fill: { height: "100%", borderRadius: layout.pill },
});
