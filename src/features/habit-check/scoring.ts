
import type { HabitType } from "./habit-types";
import { questions, type Question } from "./questions";

export function scoreHabitCheck(
  answers: number[],
  qs: Question[] = questions,
): HabitType {
  if (answers.length !== qs.length) {
    throw new Error(`Expected ${qs.length} answers, got ${answers.length}`);
  }

  const counts = new Map<HabitType, number>();
  const firstSelected = new Map<HabitType, number>();

  answers.forEach((answerIndex, questionIndex) => {
    const answer = qs[questionIndex].answers[answerIndex];

    if (!answer) {
      throw new Error(
        `Question ${questionIndex} has no answer ${answerIndex}`,
      );
    }

    counts.set(
      answer.character,
      (counts.get(answer.character) ?? 0) + 1,
    );

    if (!firstSelected.has(answer.character)) {
      firstSelected.set(answer.character, questionIndex);
    }
  });

  let best: HabitType = answers.length > 0
    ? qs[0].answers[answers[0]].character
    : "balanced";

  for (const habit of counts.keys()) {
    const count = counts.get(habit) ?? 0;
    const bestCount = counts.get(best) ?? 0;

    if (
      count > bestCount ||
      (count === bestCount &&
        (firstSelected.get(habit) ?? Infinity) <
          (firstSelected.get(best) ?? Infinity))
    ) {
      best = habit;
    }
  }

  return best;
}
