import { Pressable, StyleSheet } from "react-native";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";

/** Small text button for headers and card corners ("Ubah", "Lihat semua"). */
export function TextAction({ label, onPress, tone = "primary" }: { label: string; onPress: () => void; tone?: "primary" | "danger" }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.hit} hitSlop={4}>
      <AppText variant="label" color={tone === "danger" ? colors.dangerSoft : colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { minHeight: layout.touchTarget, justifyContent: "center", paddingHorizontal: 8 },
});
