import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Card, Hero, Mascot, MoneyText, Pad } from "@/components";
import { GoalRow } from "@/features/saving/GoalRow";
import { savedByGoal, sortGoals, totalSaved } from "@/features/saving/goals";
import { useSavings } from "@/state/savings-context";
import { colors } from "@/theme";

export default function Tabung() {
  const { goals, deposits } = useSavings();
  const insets = useSafeAreaInsets();
  const saved = savedByGoal(deposits);
  const ordered = sortGoals(goals, saved);
  const hasGoals = goals.length > 0;

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Hero tone="soft" align="start" topInset={insets.top}>
          <View style={styles.heroRow}>
            <View style={styles.grow}>
              <AppText variant="caption">Total tabunganmu</AppText>
              <MoneyText amount={totalSaved(deposits)} />
              <AppText variant="caption">di {goals.length} tujuan</AppText>
            </View>
            <Mascot pose="menabung" height={104} />
          </View>
        </Hero>

        <Pad gap={16}>
          <View style={{ marginTop: 16 }}>
            {hasGoals ? (
              <Button label="Catat setoran" onPress={() => router.push("/setoran/baru")} />
            ) : (
              <Button label="Buat tujuan baru" onPress={() => router.push("/tujuan/baru")} />
            )}
          </View>

          {hasGoals ? (
            <Card>
              <AppText variant="title">Tujuanmu</AppText>
              {ordered.map((g) => (
                <GoalRow
                  key={g.id}
                  goal={g}
                  saved={saved.get(g.id) ?? 0}
                  onPress={() => router.push({ pathname: "/tujuan/[id]", params: { id: g.id } })}
                />
              ))}
              <Button label="Buat tujuan baru" variant="secondary" onPress={() => router.push("/tujuan/baru")} />
            </Card>
          ) : (
            <View style={styles.empty}>
              <AppText align="center">Belum ada tujuan tabungan. Buat yang pertama, yuk.</AppText>
            </View>
          )}
        </Pad>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg2 },
  content: { paddingBottom: 24 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  grow: { flex: 1 },
  empty: { alignItems: "center", paddingVertical: 24 },
});
