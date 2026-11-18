import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Card, Hero, Mascot, Pad } from "@/components";
import { MISSION_POINTS, MISSION_QUESTION_COUNT, isDoneOn, missionStreak } from "@/features/missions/missions";
import { useMissions } from "@/state/missions-context";
import { useTotalPoints } from "@/state/use-points";
import { useToday } from "@/state/use-today";
import { colors, layout } from "@/theme";

/** Daily Habit Mission: today's mission card, with streak and points (docs/specs/daily-habit-mission.md). */
export default function MisiTab() {
  const today = useToday();
  const insets = useSafeAreaInsets();
  const { missions } = useMissions();
  const points = useTotalPoints();
  const streak = missionStreak(missions, today);
  const done = isDoneOn(missions, today);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Hero tone="soft" topInset={insets.top}>
          <View style={styles.chips}>
            {streak > 0 ? (
              <View style={styles.chip} accessibilityLabel={`${streak} hari beruntun`} testID="streak-chip">
                <Feather name="zap" size={16} color={colors.text} />
                <AppText variant="label">{streak} hari</AppText>
              </View>
            ) : null}
            {points > 0 ? (
              <View style={styles.chip} accessibilityLabel={`${points} poin`} testID="mission-points-chip">
                <Feather name="star" size={16} color={colors.text} />
                <AppText variant="label">{points} poin</AppText>
              </View>
            ) : null}
          </View>
          <Mascot pose={done ? "gembira" : "fokus"} height={128} />
          <AppText variant="heading" align="center">
            Misi harian
          </AppText>
        </Hero>
        <Pad>
          <View style={{ marginTop: 16 }}>
            <Card>
              {done ? (
                <>
                  <View style={styles.row}>
                    <Feather name="check-circle" size={24} color={colors.success} />
                    <AppText variant="title">Misi hari ini selesai</AppText>
                  </View>
                  <AppText>Besok ada misi baru, ya.</AppText>
                </>
              ) : (
                <>
                  <AppText variant="title">Misi hari ini</AppText>
                  <AppText>
                    {MISSION_QUESTION_COUNT} pertanyaan singkat · +{MISSION_POINTS} poin
                  </AppText>
                  <Button label="Mulai misi" onPress={() => router.push("/misi-harian")} />
                </>
              )}
            </Card>
          </View>
        </Pad>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg2 },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  chips: { flexDirection: "row", gap: 8, alignSelf: "stretch", justifyContent: "flex-end", minHeight: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pill,
    backgroundColor: colors.highlight,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
