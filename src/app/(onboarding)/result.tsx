import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Hero, Mascot, Pad, Screen } from "@/components";
import { useHabitCheck } from "@/features/habit-check/habit-check-context";
import { habitTypeContent } from "@/features/habit-check/habit-types";
import { colors } from "@/theme";

export default function Result() {
  const { habitType } = useHabitCheck();
  const insets = useSafeAreaInsets();

  // The quiz is done: Android back does nothing here.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

  if (!habitType) return <Redirect href="/welcome" />;
  const content = habitTypeContent[habitType];

  return (
    <Screen edges={["bottom"]} actions={<Button label="Lanjut" onPress={() => router.push("/budget")} />}>
      <Hero tone="soft" topInset={insets.top}>
        <Mascot pose="juara" height={170} />
        <AppText variant="label" style={{ marginTop: 12 }}>
          Tipe kebiasaanmu
        </AppText>
        <AppText variant="display" color={colors.text} align="center" style={{ fontSize: 32, lineHeight: 40 }}>
          {content.name}
        </AppText>
      </Hero>
      <Pad>
        <AppText align="center" style={{ marginTop: 24 }}>
          {content.description}
        </AppText>
      </Pad>
    </Screen>
  );
}
