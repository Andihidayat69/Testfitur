import { Feather } from "@expo/vector-icons";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, StyleSheet, View } from "react-native";

import { AppText, Button, Confetti, Hero, Mascot, MoneyText, Pad, Screen, StepHeader } from "@/components";
import { usePauseDraft } from "@/features/pause/pause-draft-context";
import { useJajan } from "@/state/use-jajan";
import { useToday } from "@/state/use-today";
import { colors, layout } from "@/theme";

const goHome = () => router.dismissTo("/beranda");

/** Step 4: celebrate waiting, or confirm the purchase. */
export default function PauseResult() {
  const { result, item } = usePauseDraft();
  const today = useToday();
  const { status } = useJajan(today);

  // The decision is final: Android back goes to Home.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  if (!result) return <Redirect href="/tahan" />;
  const header = <StepHeader label="Langkah 4 dari 4" step={3} total={4} onBack={goHome} />;

  if (result.pause.decision === "wait") {
    const moveToSaving = () =>
      router.push({
        pathname: "/setoran/baru",
        params: { pauseId: result.pause.id, amount: String(result.pause.price) },
      });
    return (
      <Screen
        header={header}
        actions={
          <>
            <Button label="Pindahkan ke tabungan" onPress={moveToSaving} />
            <Button label="Kembali ke beranda" variant="secondary" onPress={goHome} />
          </>
        }
      >
        <Hero tone="soft">
          <Confetti />
          <Mascot pose="gembira" height={160} />
          <AppText variant="heading" align="center" style={{ marginTop: 8 }}>
            Keren, kamu tahan diri!
          </AppText>
        </Hero>
        <Pad gap={8}>
          <View style={styles.center}>
            <AppText variant="caption" style={{ marginTop: 16 }}>
              Uang yang terselamatkan
            </AppText>
            <View style={styles.row}>
              <Feather name="check-circle" size={28} color={colors.success} />
              <MoneyText amount={result.pause.price} />
            </View>
            {result.pause.points > 0 ? (
              <View style={styles.points} testID="points-earned">
                <Feather name="star" size={16} color={colors.text} />
                <AppText variant="label">+{result.pause.points} poin</AppText>
              </View>
            ) : null}
          </View>
        </Pad>
      </Screen>
    );
  }

  return (
    <Screen header={header} actions={<Button label="Kembali ke beranda" onPress={goHome} />}>
      <Hero tone="soft">
        <Mascot pose="jempol" height={150} />
        <AppText variant="heading" align="center" style={{ marginTop: 8 }}>
          Oke, sudah dicatat
        </AppText>
      </Hero>
      <Pad>
        <View style={styles.center}>
          <AppText align="center" numberOfLines={2} style={{ marginTop: 16 }}>
            Selamat menikmati {item}!
          </AppText>
          <AppText variant="caption" style={{ marginTop: 16 }}>
            Sisa jajanmu sekarang
          </AppText>
          <MoneyText amount={status.left} color={status.left < 0 ? colors.dangerSoft : colors.text} />
        </View>
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.pill,
    backgroundColor: colors.highlight,
  },
});
