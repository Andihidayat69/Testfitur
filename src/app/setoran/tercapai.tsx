import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

import { AppText, Button, Confetti, Hero, Mascot, Pad, Screen } from "@/components";
import { formatRupiah } from "@/lib/money";
import { useSavings } from "@/state/savings-context";

/** One-time celebration when a deposit makes a goal reach its target. */
export default function GoalReached() {
  const { goalId, then } = useLocalSearchParams<{ goalId: string; then?: string }>();
  const { goals } = useSavings();
  const goal = goals.find((g) => g.id === goalId);
  const leave = useCallback(() => (then === "home" ? router.dismissTo("/beranda") : router.back()), [then]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        leave();
        return true;
      });
      return () => sub.remove();
    }, [leave]),
  );

  return (
    <Screen edges={["bottom"]} actions={<Button label="Kembali" onPress={leave} />}>
      <Hero tone="soft">
        <Confetti />
        <Mascot pose="gembira" height={170} />
        <AppText variant="heading" align="center" style={{ marginTop: 8 }}>
          Tujuan tercapai!
        </AppText>
      </Hero>
      <Pad>
        {goal ? (
          <AppText align="center" style={{ marginTop: 24 }}>
            {goal.name} sudah terkumpul {formatRupiah(goal.target)}.
          </AppText>
        ) : null}
      </Pad>
    </Screen>
  );
}
