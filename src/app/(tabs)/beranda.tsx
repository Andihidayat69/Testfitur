import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Card, Hero, Mascot, MoneyText, Pad, ProgressBar } from "@/components";
import { moodContent } from "@/features/home/jajan-left";
import { PaydayPopup } from "@/features/payday/PaydayPopup";
import { MainGoalCard } from "@/features/saving/MainGoalCard";
import { formatRupiah } from "@/lib/money";
import { useJajan } from "@/state/use-jajan";
import { useTotalPoints } from "@/state/use-points";
import { useToday } from "@/state/use-today";
import { colors, layout } from "@/theme";

const logo = require("@/assets/brand/logo-horizontal.png");

export default function Beranda() {
  const today = useToday();
  const { budget, status } = useJajan(today);
  const mood = moodContent[status.mood];
  const over = status.mood === "over";
  const insets = useSafeAreaInsets();
  const points = useTotalPoints();

  return (
    <View style={styles.safe}>
      {/* The header's Ice Blue runs up behind the status bar, so there is no white strip. */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Jajan Tenang" />
        <View style={styles.grow} />
        {points > 0 ? (
          <View style={styles.points} accessibilityLabel={`${points} poin`} testID="points-chip">
            <Feather name="star" size={16} color={colors.text} />
            <AppText variant="label">{points} poin</AppText>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profil"
          onPress={() => router.push("/profil")}
          style={styles.profileButton}
          hitSlop={4}
        >
          <Feather name="user" size={24} color={colors.text} />
        </Pressable>
      </View>

      <Hero tone="soft" align="start">
        <AppText variant="title" testID="jajan-mood">
          {mood.line}
        </AppText>
        <View style={styles.heroRow}>
          <View style={styles.grow}>
            <AppText variant="caption">Sisa jajan bulan ini</AppText>
            <MoneyText amount={status.left} color={over ? colors.dangerSoft : colors.text} />
            <AppText variant="caption">dari kuota {formatRupiah(budget)}</AppText>
          </View>
          <Mascot pose={mood.mascot} height={112} />
        </View>
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={status.spentShare} tone={status.mood === "safe" ? "default" : "danger"} onTinted />
        </View>
      </Hero>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pad gap={16}>
          <View style={{ marginTop: 16 }}>
            <Card>
              <View style={styles.cardRow}>
                <View style={styles.iconCircle}>
                  <Feather name="clock" size={24} color={colors.primary} />
                </View>
                <View style={styles.grow}>
                  <AppText variant="title">Mau beli sesuatu?</AppText>
                  <AppText>Tahan dulu, cek sisa jajanmu.</AppText>
                </View>
              </View>
              <Button label="Tahan dulu" onPress={() => router.push("/tahan")} />
            </Card>
          </View>
          <MainGoalCard />
        </Pad>
      </ScrollView>
      <PaydayPopup today={today} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: layout.sideMargin,
    paddingRight: 8,
    paddingVertical: 4,
    backgroundColor: colors.bg1,
  },
  logo: { height: 32, width: 32 * (600 / 273) },
  profileButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingBottom: 24 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pill,
    backgroundColor: colors.highlight,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flex: 1, gap: 2 },
});
