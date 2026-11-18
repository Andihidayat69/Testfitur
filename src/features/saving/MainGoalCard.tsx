import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText, Card, Mascot } from "@/components";
import { useSavings } from "@/state/savings-context";

import { GoalRow } from "./GoalRow";
import { mainGoal, savedByGoal } from "./goals";

/** Home's main saving goal card (docs/specs/smart-saving.md). */
export function MainGoalCard() {
  const { goals, deposits } = useSavings();
  const saved = savedByGoal(deposits);
  const main = mainGoal(goals, saved);

  if (goals.length === 0) {
    return (
      <Card onPress={() => router.push("/tujuan/baru")} accessibilityLabel="Buat tujuan tabungan">
        <View style={styles.row}>
          <Mascot pose="menabung" height={96} float={false} />
          <AppText style={styles.grow}>Belum ada tujuan tabungan. Buat yang pertama, yuk.</AppText>
        </View>
      </Card>
    );
  }

  if (!main) {
    return (
      <Card onPress={() => router.push("/tabung")} accessibilityLabel="Lihat tabungan">
        <View style={styles.row}>
          <Mascot pose="tabungan-aman" height={96} float={false} />
          <AppText style={styles.grow}>Semua tujuanmu tercapai. Keren!</AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <AppText variant="caption">Tujuan utama</AppText>
      <GoalRow
        goal={main}
        saved={saved.get(main.id) ?? 0}
        onPress={() => router.push({ pathname: "/tujuan/[id]", params: { id: main.id } })}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  grow: { flex: 1 },
});
