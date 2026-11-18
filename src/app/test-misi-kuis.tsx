import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { QuizOptionState } from "@/components";
import { AppText, Button, Card, Pad, QuizOption, Screen } from "@/components";
import { missionQuestions } from "@/features/missions/questions";

export default function TestMissionQuiz() {
  const params = useLocalSearchParams<{ level?: string }>();
  const level = Math.min(
    100,
    Math.max(1, Number.parseInt(params.level ?? "1", 10) || 1),
  );

  const questions = useMemo(
    () => missionQuestions.filter((question) => question.level === level),
    [level],
  );

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length !== 3) {
    return (
      <Screen>
        <Pad gap={12}>
          <AppText variant="heading">Pertanyaan tidak ditemukan</AppText>
          <AppText>Level {level} tidak memiliki tiga pertanyaan.</AppText>
          <Button label="Kembali" onPress={() => router.back()} />
        </Pad>
      </Screen>
    );
  }

  if (finished) {
    return (
      <Screen>
        <Pad gap={16}>
          <Card>
            <AppText variant="heading">Simulasi selesai!</AppText>
            <AppText variant="display">
              {correct}/{questions.length} benar
            </AppText>
            <AppText>Level {level}</AppText>
            <AppText>
              Ini hanya hasil simulasi. Tidak ada poin atau riwayat yang
              disimpan.
            </AppText>
          </Card>
          <Button
            label="Ulangi level"
            onPress={() => {
              setIndex(0);
              setPicked(null);
              setCorrect(0);
              setFinished(false);
            }}
          />
          <Button
            label="Pilih level lain"
            onPress={() => router.replace("/test-misi")}
          />
        </Pad>
      </Screen>
    );
  }

  const question = questions[index];
  const answered = picked !== null;
  const right =
    picked ===
    question.options.findIndex((option) => option.key === question.correctKey);

  const correctIndex = question.options.findIndex(
    (option) => option.key === question.correctKey,
  );

  const choose = (option: number) => {
    if (answered) return;
    setPicked(option);
    if (option === correctIndex) setCorrect((value) => value + 1);
  };

  const next = () => {
    if (index === questions.length - 1) {
      setFinished(true);
    } else {
      setIndex((value) => value + 1);
      setPicked(null);
    }
  };

  const stateOf = (option: number): QuizOptionState => {
    if (!answered) return "idle";
    if (option === correctIndex) return "correct";
    return option === picked ? "wrong" : "dim";
  };

  return (
    <Screen
      header={
        <View style={styles.header}>
          <AppText variant="label">TEST MODE · LEVEL {level}</AppText>
          <AppText>
            Pertanyaan {index + 1} dari {questions.length}
          </AppText>
        </View>
      }
      actions={
        <Button
          label={index === questions.length - 1 ? "Lihat hasil" : "Lanjut"}
          disabled={!answered}
          onPress={next}
        />
      }
    >
      <Pad gap={16}>
        <AppText variant="title">{question.text}</AppText>
        {question.options.map((option, optionIndex) => (
          <QuizOption
            key={option.key}
            label={option.text}
            state={stateOf(optionIndex)}
            onPress={() => choose(optionIndex)}
            disabled={answered}
          />
        ))}
        {answered ? (
          <Card>
            <AppText variant="label">
              {right ? "Betul!" : "Belum tepat."}
            </AppText>
            <AppText>
              Jawaban benar: {question.options[correctIndex]?.text}
            </AppText>
          </Card>
        ) : null}
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});
