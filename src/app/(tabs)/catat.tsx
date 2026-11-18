import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Card, Hero, Mascot, MoneyText, Pad } from "@/components";
import { CategoryShareRow } from "@/features/expenses/CategoryShareRow";
import { EntryRow } from "@/features/expenses/EntryRow";
import { categoryName, entriesInMonth, sortNewestFirst, summarizeMonth } from "@/features/expenses/summary";
import { monthOf } from "@/lib/dates";
import { useEntries } from "@/state/entries-context";
import { useToday } from "@/state/use-today";
import { colors } from "@/theme";

export default function Catat() {
  const today = useToday();
  const { entries } = useEntries();
  const month = monthOf(today);
  const summary = summarizeMonth(entries, month);
  const thisMonth = entriesInMonth(entries, month);
  const recent = sortNewestFirst(entries).slice(0, 3);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Hero tone="soft" align="start" topInset={insets.top}>
          <View style={styles.heroRow}>
            <View style={styles.grow}>
              <AppText variant="caption">Pengeluaran bulan ini</AppText>
              <MoneyText amount={summary.spending} />
              {summary.largestCategory ? (
                <AppText variant="caption">Paling banyak: {categoryName(summary.largestCategory)}</AppText>
              ) : null}
            </View>
            <Mascot pose="jempol" height={96} />
          </View>
        </Hero>

        <Pad gap={16}>
          <View style={{ marginTop: 16 }}>
            <Button label="Catat pengeluaran" onPress={() => router.push("/catatan/baru")} />
          </View>

          {thisMonth.length === 0 ? (
            <View style={styles.empty}>
              <Mascot pose="fokus" height={120} />
              <AppText align="center">Belum ada catatan bulan ini. Catat jajan pertamamu, yuk.</AppText>
            </View>
          ) : (
            <>
              {summary.byCategory.length > 0 ? (
                <Card>
                  <CardTitle title="Per kategori" onMore={() => router.push("/riwayat")} />
                  {summary.byCategory.slice(0, 3).map((total) => (
                    <CategoryShareRow key={total.category} total={total} />
                  ))}
                </Card>
              ) : null}
              <Card>
                <CardTitle title="Terakhir" onMore={() => router.push("/riwayat")} />
                {recent.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    today={today}
                    onPress={() => router.push({ pathname: "/catatan/[id]", params: { id: entry.id } })}
                  />
                ))}
              </Card>
            </>
          )}
        </Pad>
      </ScrollView>
    </View>
  );
}

function CardTitle({ title, onMore }: { title: string; onMore: () => void }) {
  return (
    <View style={styles.cardTitle}>
      <AppText variant="title" style={styles.grow}>
        {title}
      </AppText>
      <AppText
        variant="label"
        color={colors.primary}
        onPress={onMore}
        accessibilityRole="link"
        suppressHighlighting
        style={styles.more}
      >
        Lihat semua
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg2 },
  content: { paddingBottom: 24 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  grow: { flex: 1 },
  empty: { alignItems: "center", gap: 12, paddingVertical: 24 },
  cardTitle: { flexDirection: "row", alignItems: "center" },
  more: { paddingVertical: 12, paddingLeft: 12 },
});
