import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, Card, MoneyText, Pad, Screen, StepHeader } from "@/components";
import { CategoryShareRow } from "@/features/expenses/CategoryShareRow";
import { EntryRow } from "@/features/expenses/EntryRow";
import { entriesInMonth, groupByDay, summarizeMonth } from "@/features/expenses/summary";
import { addMonths, dayLabel, monthLabel, monthOf } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { useEntries } from "@/state/entries-context";
import { useToday } from "@/state/use-today";
import { colors, layout } from "@/theme";

export default function Riwayat() {
  const today = useToday();
  const { entries } = useEntries();
  const currentMonth = monthOf(today);
  const [month, setMonth] = useState(currentMonth);

  const firstMonth = entries.reduce((min, e) => (monthOf(e.occurredOn) < min ? monthOf(e.occurredOn) : min), currentMonth);
  const summary = summarizeMonth(entries, month);
  const days = groupByDay(entriesInMonth(entries, month));

  return (
    <Screen header={<StepHeader label="Riwayat" onBack={() => router.back()} />}>
      <Pad gap={16}>
        <View style={styles.switcher}>
          <MonthArrow icon="chevron-left" label="Bulan sebelumnya" disabled={month <= firstMonth} onPress={() => setMonth(addMonths(month, -1))} />
          <AppText variant="title" testID="history-month">
            {monthLabel(month)}
          </AppText>
          <MonthArrow icon="chevron-right" label="Bulan berikutnya" disabled={month >= currentMonth} onPress={() => setMonth(addMonths(month, 1))} />
        </View>

        <Card>
          <AppText variant="caption">Pengeluaran</AppText>
          <MoneyText amount={summary.spending} />
          <View style={styles.pair}>
            <View style={styles.grow}>
              <AppText variant="caption">Pemasukan</AppText>
              <AppText variant="label" color={colors.success}>
                {formatRupiah(summary.income)}
              </AppText>
            </View>
            <View style={styles.grow}>
              <AppText variant="caption">Selisih</AppText>
              <AppText variant="label" testID="history-difference">
                {formatRupiah(summary.difference)}
              </AppText>
            </View>
          </View>
        </Card>

        {summary.byCategory.length > 0 ? (
          <Card>
            <AppText variant="title">Per kategori</AppText>
            {summary.byCategory.map((total) => (
              <CategoryShareRow key={total.category} total={total} />
            ))}
          </Card>
        ) : null}

        {days.length === 0 ? (
          <AppText align="center" style={{ marginTop: 16 }}>
            Belum ada catatan di bulan ini.
          </AppText>
        ) : (
          days.map((group) => (
            <View key={group.day} style={styles.day}>
              <AppText variant="label">{dayLabel(group.day, today)}</AppText>
              <Card>
                {group.entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    today={today}
                    showDay={false}
                    onPress={() => router.push({ pathname: "/catatan/[id]", params: { id: entry.id } })}
                  />
                ))}
              </Card>
            </View>
          ))
        )}
      </Pad>
    </Screen>
  );
}

function MonthArrow(props: { icon: "chevron-left" | "chevron-right"; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      onPress={props.onPress}
      style={[styles.arrow, props.disabled && { opacity: 0.3 }]}
    >
      <Feather name={props.icon} size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  arrow: { width: layout.touchTarget, height: layout.touchTarget, alignItems: "center", justifyContent: "center" },
  pair: { flexDirection: "row", gap: 12, marginTop: 4 },
  grow: { flex: 1, gap: 2 },
  day: { gap: 8 },
});
