import { StyleSheet, View } from "react-native";

import { AppText, ProgressBar } from "@/components";
import { formatRupiah } from "@/lib/money";

import { categoryName, type CategoryTotal } from "./summary";

export function CategoryShareRow({ total }: { total: CategoryTotal }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText numberOfLines={1} style={styles.grow}>
          {categoryName(total.category)}
        </AppText>
        <AppText variant="label">{formatRupiah(total.amount)}</AppText>
      </View>
      <ProgressBar value={total.share} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  grow: { flex: 1 },
});
