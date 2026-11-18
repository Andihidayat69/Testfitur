import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components";
import { dayLabel } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { colors, layout } from "@/theme";

import { expenseCategories } from "./categories";
import { entryTitle, type Entry } from "./entry";

type Props = { entry: Entry; today: string; showDay?: boolean; onPress: () => void };

export function EntryRow({ entry, today, showDay = true, onPress }: Props) {
  const income = entry.type === "income";
  const info = entry.category ? expenseCategories[entry.category] : null;
  const title = entryTitle(entry);
  const meta = [income ? "Pemasukan" : info?.name, showDay ? dayLabel(entry.occurredOn, today) : null]
    .filter(Boolean)
    .join(" · ");
  const amount = `${income ? "+" : "−"}${formatRupiah(entry.amount)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${meta}, ${amount}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.icon}>
        <Feather
          name={(income ? "arrow-down-left" : (info?.icon ?? "circle")) as never}
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={styles.grow}>
        <AppText numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {meta}
        </AppText>
      </View>
      <AppText variant="label" color={income ? colors.success : colors.text} style={styles.amount}>
        {amount}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: layout.touchTarget, paddingVertical: 6 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flex: 1 },
  title: { fontFamily: "PlusJakartaSans_600SemiBold" },
  amount: { fontVariant: ["tabular-nums"] },
});
