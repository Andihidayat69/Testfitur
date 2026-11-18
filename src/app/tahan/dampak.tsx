import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Hero, Mascot, MoneyText, Pad, Screen, StepHeader } from "@/components";
import { impactContent, pauseImpact } from "@/features/pause/pause";
import { usePauseDraft } from "@/features/pause/pause-draft-context";
import { formatRupiah } from "@/lib/money";
import { useJajan } from "@/state/use-jajan";
import { useToday } from "@/state/use-today";
import { colors } from "@/theme";

/** Step 2: what buying it does to this month's jajan. */
export default function PauseImpact() {
  const draft = usePauseDraft();
  const today = useToday();
  const { budget, status } = useJajan(today);
  if (!draft.price) return <Redirect href="/tahan" />;

  const impact = pauseImpact(budget, status.left, draft.price);
  const content = impactContent[impact.level];
  const ok = impact.level === "safe";

  return (
    <Screen
      header={<StepHeader label="Langkah 2 dari 4" step={1} total={4} onBack={() => router.back()} />}
      actions={<Button label="Lanjut" onPress={() => router.push("/tahan/pikir")} />}
    >
      <Hero tone="soft">
        <Mascot pose={content.mascot} height={140} />
        <AppText variant="caption" numberOfLines={1} style={{ marginTop: 8 }}>
          Sisa jajanmu kalau beli {draft.item}
        </AppText>
        <MoneyText amount={impact.after} color={impact.after < 0 ? colors.dangerSoft : colors.text} />
        <AppText variant="caption">Sekarang {formatRupiah(impact.now)}</AppText>
      </Hero>
      <Pad>
        <View style={{ marginTop: 16 }}>
          <Card>
            <View style={styles.note} testID={`impact-${impact.level}`}>
              <Feather
                name={content.icon as never}
                size={24}
                color={ok ? colors.success : colors.dangerSoft}
              />
              <AppText style={styles.grow}>{content.note}</AppText>
            </View>
          </Card>
        </View>
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: "row", alignItems: "center", gap: 12 },
  grow: { flex: 1 },
});
