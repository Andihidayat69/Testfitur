import { Feather } from "@expo/vector-icons";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Confetti,
  ConfirmDialog,
  Hero,
  Mascot,
  Pad,
  QuizOption,
  Screen,
  StepHeader,
  useToast,
  type QuizOptionState,
} from "@/components";
import {
  MISSION_QUESTION_COUNT,
  buildMission,
  isDoneOn,
  type Mission,
} from "@/features/missions/missions";
import { toLocalDate } from "@/lib/dates";
import { useMissions } from "@/state/missions-context";
import { colors, layout } from "@/theme";

const backToMissions = () => router.dismissTo("/misi");

/** One daily mission: 3 questions, kind feedback, then the result (docs/specs/daily-habit-mission.md). */
export default function DailyMission() {
  const { missions, completeMission } = useMissions();
  const showToast = useToast();
  // The mission belongs to the day it started, even if midnight passes while playing.
  const [today] = useState(() => toLocalDate(new Date()));
  const [alreadyDone] = useState(() => isDoneOn(missions, today));
  const [plan] = useState(() => buildMission(today, missions));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<Mission | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  // Android back: ask before leaving a mission in progress; after the result, go to Misi.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (result) backToMissions();
        else setConfirmExit(true);
        return true;
      });
      return () => sub.remove();
    }, [result]),
  );

  if (alreadyDone && !result) return <Redirect href="/misi" />;

  if (result) {
    const perfect = result.correct === MISSION_QUESTION_COUNT;
    return (
      <Screen
        actions={<Button label="Kembali ke misi" onPress={backToMissions} />}
      >
        <Hero tone="soft">
          <Confetti />
          <Mascot pose={perfect ? "juara" : "jempol"} height={150} />
          <AppText variant="heading" align="center" style={{ marginTop: 8 }}>
            Misi selesai!
          </AppText>
        </Hero>
        <Pad gap={8}>
          <View style={styles.center}>
            <AppText variant="display" style={{ marginTop: 16 }}>
              {result.correct}/{MISSION_QUESTION_COUNT} betul
            </AppText>
            <View style={styles.points} testID="points-earned">
              <Feather name="star" size={16} color={colors.text} />
              <AppText variant="label">+{result.points} poin</AppText>
            </View>
          </View>
        </Pad>
      </Screen>
    );
  }

  const question = plan.questions[index];
  const answered = picked !== null;
  const right = picked === question.correctIndex;
  const last = index === plan.questions.length - 1;

  const choose = (option: number) => {
    if (answered) return;
    setPicked(option);
    if (option === question.correctIndex) setCorrectCount((count) => count + 1);
  };

  const next = async () => {
    if (!last) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setBusy(true);
    try {
      const saved = await completeMission({
        doneOn: today,
        level: plan.level,
        questionIds: plan.questions.map((q) => q.id),
        correct: correctCount,
      });
      setResult(saved);
    } catch {
      // Never log answers. The user can tap the button again.
      showToast("Misinya belum tersimpan. Coba lagi, ya.");
    } finally {
      setBusy(false);
    }
  };

  const stateOf = (option: number): QuizOptionState => {
    if (!answered) return "idle";
    if (option === question.correctIndex) return "correct";
    return option === picked ? "wrong" : "dim";
  };

  return (
    <Screen
      header={
        <StepHeader
          label={`Pertanyaan ${index + 1} dari ${plan.questions.length}`}
          step={index}
          total={plan.questions.length}
          onBack={() => setConfirmExit(true)}
        />
      }
      actions={
        <Button
          label={last ? "Lihat hasil" : "Lanjut"}
          onPress={next}
          disabled={!answered || busy}
        />
      }
    >
      <Hero tone="soft">
        <Mascot pose="berpikir" height={112} />
        <AppText variant="title" align="center" testID="mission-question">
          {question.text}
        </AppText>
      </Hero>
      <Pad>
        <View style={styles.options}>
          {question.options.map((label, option) => (
            <QuizOption
              key={label}
              label={label}
              state={stateOf(option)}
              onPress={() => choose(option)}
              disabled={answered}
            />
          ))}
        </View>
        {answered ? (
          <View
            style={styles.feedback}
            accessibilityLiveRegion="polite"
            testID="mission-feedback"
          >
            <Feather
              name={right ? "check-circle" : "info"}
              size={24}
              color={right ? colors.success : colors.dangerSoft}
            />
            <View style={styles.feedbackText}>
              <AppText variant="label">{right ? "Betul!" : "Hampir!"}</AppText>
              {question.explanation ? (
                <AppText>{question.explanation}</AppText>
              ) : null}
            </View>
          </View>
        ) : null}
      </Pad>
      <ConfirmDialog
        visible={confirmExit}
        title="Keluar dari misi? Progresmu tidak disimpan."
        confirmLabel="Ya, keluar"
        cancelLabel="Lanjut misi"
        onConfirm={() => {
          setConfirmExit(false);
          router.back();
        }}
        onCancel={() => setConfirmExit(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 4 },
  options: { gap: 12, marginTop: 16 },
  feedback: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    marginTop: 16,
    borderRadius: layout.radius,
    backgroundColor: colors.card,
  },
  feedbackText: { flex: 1, gap: 2 },
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
