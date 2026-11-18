import { Redirect, router, useLocalSearchParams } from "expo-router";

import { AppText, Button, ChipOption, Pad, Screen, StepHeader } from "@/components";
import { useHabitCheck } from "@/features/habit-check/habit-check-context";
import { questions } from "@/features/habit-check/questions";
import { scoreHabitCheck } from "@/features/habit-check/scoring";

export default function QuestionScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { answers, setAnswer, setHabitType } = useHabitCheck();
  const index = Number(step) - 1;
  const question = questions[index];
  if (!question) return <Redirect href="/welcome" />;

  const selected = answers[index];
  const isLast = index === questions.length - 1;

  const next = () => {
    if (!isLast) {
      router.push(`/question/${index + 2}`);
      return;
    }
    const chosen = questions.map((_, i) => answers[i]);
    if (chosen.some((a) => a === undefined)) return; // unreachable through the UI
    setHabitType(scoreHabitCheck(chosen as number[]));
    router.push("/result");
  };

  return (
    <Screen
      header={
        <StepHeader
          label={`Pertanyaan ${index + 1} dari ${questions.length}`}
          step={index}
          total={questions.length}
          onBack={() => router.back()}
        />
      }
      actions={<Button label="Lanjut" onPress={next} disabled={selected === undefined} />}
    >
      <Pad gap={12}>
        <AppText variant="title" style={{ marginTop: 12 }}>
          {question.text}
        </AppText>
        <AppText style={{ marginBottom: 12 }}>Tenang, tidak ada jawaban salah.</AppText>
        {question.answers.map((answer, i) => (
          <ChipOption key={answer.label} label={answer.label} selected={selected === i} onPress={() => setAnswer(index, i)} />
        ))}
      </Pad>
    </Screen>
  );
}
