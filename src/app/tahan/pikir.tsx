import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Hero, Mascot, Pad, Screen, StepHeader } from "@/components";
import { reflectionQuestions, type PauseDecision } from "@/features/pause/pause";
import { usePauseDraft } from "@/features/pause/pause-draft-context";
import { toLocalDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { usePauses } from "@/state/pauses-context";
import { colors, layout } from "@/theme";

/** Step 3: one question, then wait or buy. */
export default function PauseThink() {
  const draft = usePauseDraft();
  const { recordDecision } = usePauses();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!draft.price) return <Redirect href="/tahan" />;

  const decide = async (decision: PauseDecision) => {
    setBusy(true);
    setFailed(false);
    try {
      const result = await recordDecision({
        item: draft.item,
        price: draft.price,
        category: draft.category,
        question: draft.question,
        decision,
        decidedOn: toLocalDate(new Date()), // the date when the decision is made
      });
      draft.setResult(result);
      router.push("/tahan/hasil");
    } catch {
      // Never log the item or price.
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      header={<StepHeader label="Langkah 3 dari 4" step={2} total={4} onBack={() => router.back()} />}
      actions={
        <>
          <Button label="Tunda dulu" onPress={() => decide("wait")} disabled={busy} />
          <Button label="Tetap beli" variant="secondary" onPress={() => decide("buy")} disabled={busy} />
        </>
      }
    >
      <Hero tone="soft">
        <Mascot pose="berpikir" height={140} />
        <AppText variant="caption" numberOfLines={1} style={{ marginTop: 8 }}>
          {draft.item} · {formatRupiah(draft.price)}
        </AppText>
        <AppText variant="title" align="center" testID="reflection-question">
          {reflectionQuestions[draft.question - 1]}
        </AppText>
      </Hero>
      <Pad>
        <AppText align="center" style={{ marginTop: 16 }}>
          Tenang, nggak ada jawaban salah. Pilih yang paling jujur, ya.
        </AppText>
        {failed ? (
          <View style={styles.failure} accessibilityLiveRegion="polite">
            <Mascot pose="sedih" height={96} float={false} />
            <AppText style={{ flex: 1 }}>Maaf, belum berhasil disimpan. Coba lagi, ya.</AppText>
          </View>
        ) : null}
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  failure: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginTop: 16,
    borderRadius: layout.radius,
    backgroundColor: colors.card,
  },
});
