import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, ProgressBar } from "@/components";
import { formatRupiah } from "@/lib/money";
import { colors, layout } from "@/theme";

import { goalProgress, type SavingGoal } from "./goals";

type Props = { goal: SavingGoal; saved: number; onPress: () => void };

export function GoalIconCircle({ icon, size = 40 }: { icon: SavingGoal["icon"]; size?: number }) {
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size / 2 }]}>
      <Feather name={icon} size={size / 2} color={colors.primary} />
    </View>
  );
}

export function ReachedBadge() {
  return (
    <View style={styles.badge} testID="reached-badge">
      <AppText variant="label">Tercapai</AppText>
    </View>
  );
}

export function GoalRow({ goal, saved, onPress }: Props) {
  const p = goalProgress(goal.target, saved);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}, ${p.percent} persen, ${formatRupiah(saved)} dari ${formatRupiah(goal.target)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <GoalIconCircle icon={goal.icon} />
      <View style={styles.grow}>
        <View style={styles.titleRow}>
          <AppText numberOfLines={1} style={[styles.grow, styles.name]}>
            {goal.name}
          </AppText>
          {p.reached ? (
            <ReachedBadge />
          ) : (
            <AppText variant="label" color={colors.primary}>
              {p.percent}%
            </AppText>
          )}
        </View>
        <AppText variant="caption">
          {formatRupiah(saved)} dari {formatRupiah(goal.target)}
        </AppText>
        <View style={{ marginTop: 6 }}>
          <ProgressBar value={p.share} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, paddingVertical: 8, minHeight: layout.touchTarget },
  icon: { backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  grow: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontFamily: "PlusJakartaSans_600SemiBold" },
  badge: { backgroundColor: colors.highlight, borderRadius: layout.pill, paddingHorizontal: 10, paddingVertical: 2 },
});
