import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";

type Props = { label: string; selected: boolean; onPress: () => void };

/** Full-width answer option, used for quiz answers and single choices. */
export function ChipOption({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      style={[styles.option, selected ? styles.selected : styles.idle]}
    >
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <Feather name="check" size={14} color={colors.white} /> : null}
      </View>
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
  idle: { backgroundColor: colors.white, borderColor: colors.accent },
  selected: { backgroundColor: colors.accent, borderColor: colors.primary },
  label: { flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
