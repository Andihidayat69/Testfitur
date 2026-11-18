import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AppText, Button, Hero, Mascot, Pad, Screen } from "@/components";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <Screen edges={["bottom"]} actions={<Button label="Mulai" onPress={() => router.push("/question/1")} />}>
      <Hero tone="soft" topInset={insets.top}>
        <Mascot pose="sapa" height={280} />
      </Hero>
      <Pad gap={8}>
        <AppText variant="heading" align="center" style={{ marginTop: 24 }}>
          Hai, aku teman jajanmu!
        </AppText>
        <AppText align="center">
          Jajan tetap jalan, tabungan tetap aman. Kenalan dulu sama kebiasaan uangmu, yuk.
        </AppText>
      </Pad>
    </Screen>
  );
}
