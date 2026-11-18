import { Pressable, StyleSheet } from "react-native";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";

type Props = { label: string; selected: boolean; onPress: () => void };

/** Small pill for quick picks, such as budget amounts. */
export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : styles.idle]}
    >
      <AppText variant="label" numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: layout.touchTarget,
    borderRadius: layout.pill,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  idle: { backgroundColor: colors.white, borderColor: colors.accent },
  selected: { backgroundColor: colors.accent, borderColor: colors.primary },
});
