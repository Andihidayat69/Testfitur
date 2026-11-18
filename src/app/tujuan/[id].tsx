import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  ConfirmDialog,
  Hero,
  Mascot,
  MoneyText,
  Pad,
  ProgressBar,
  Screen,
  StepHeader,
  TextAction,
  useToast,
} from "@/components";
import { GoalIconCircle } from "@/features/saving/GoalRow";
import { goalProgress } from "@/features/saving/goals";
import { dayLabel } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { useSavings } from "@/state/savings-context";
import { useToday } from "@/state/use-today";
import { colors, layout } from "@/theme";

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { goals, deposits, deleteGoal } = useSavings();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const goal = goals.find((g) => g.id === id);
  if (!goal) return <Redirect href="/tabung" />;

  const mine = deposits
    .filter((d) => d.goalId === goal.id)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.getTime() - a.createdAt.getTime());
  const saved = mine.reduce((s, d) => s + d.amount, 0);
  const p = goalProgress(goal.target, saved);

  return (
    <Screen
      header={
        <StepHeader
          label="Tujuan"
          onBack={() => router.back()}
          right={
            <View style={styles.actions}>
              <TextAction label="Ubah" onPress={() => router.push({ pathname: "/tujuan/ubah/[id]", params: { id: goal.id } })} />
              <TextAction label="Hapus tujuan" tone="danger" onPress={() => setConfirmDelete(true)} />
            </View>
          }
        />
      }
      actions={
        <Button
          label="Catat setoran"
          onPress={() => router.push({ pathname: "/setoran/baru", params: { goalId: goal.id } })}
        />
      }
    >
      <Hero tone="soft">
        {p.reached ? <Mascot pose="tabungan-aman" height={120} /> : <GoalIconCircle icon={goal.icon} size={56} />}
        <AppText variant="title" align="center" numberOfLines={2}>
          {goal.name}
        </AppText>
        <MoneyText amount={saved} />
        <AppText variant="caption">dari target {formatRupiah(goal.target)}</AppText>
        <View style={styles.bar}>
          <ProgressBar value={p.share} onTinted />
        </View>
        <AppText testID="goal-status">
          {p.reached ? "Tercapai! Keren banget." : `Kurang ${formatRupiah(p.remaining)} lagi.`}
        </AppText>
      </Hero>

      <Pad gap={12}>
        <AppText variant="title" style={{ marginTop: 16 }}>
          Riwayat setoran
        </AppText>
        {mine.length === 0 ? (
          <AppText>Belum ada setoran. Catat yang pertama, yuk.</AppText>
        ) : (
          <Card>
            {mine.map((d) => (
              <View key={d.id} style={styles.depositRow}>
                <AppText
                  style={styles.grow}
                  onPress={() => router.push({ pathname: "/setoran/[id]", params: { id: d.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Setoran ${formatRupiah(d.amount)}, ${dayLabel(d.occurredOn, today)}`}
                >
                  {dayLabel(d.occurredOn, today)}
                  {d.source === "pause" ? " · dari Tahan dulu" : ""}
                </AppText>
                <AppText variant="label" color={colors.success}>
                  +{formatRupiah(d.amount)}
                </AppText>
              </View>
            ))}
          </Card>
        )}
      </Pad>

      <ConfirmDialog
        visible={confirmDelete}
        title="Hapus tujuan ini? Setorannya juga ikut terhapus."
        confirmLabel="Hapus"
        onConfirm={async () => {
          setConfirmDelete(false);
          router.back();
          await deleteGoal(goal.id);
          toast("Tujuan dihapus.");
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row" },
  bar: { alignSelf: "stretch", marginTop: 8 },
  depositRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: layout.touchTarget },
  grow: { flex: 1 },
});
