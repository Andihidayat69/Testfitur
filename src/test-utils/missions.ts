import { fireEvent, screen } from "expo-router/testing-library";

import type { Mission } from "@/features/missions/missions";
import {
  missionQuestions,
  type MissionQuestion,
} from "@/features/missions/questions";

let counter = 0;

/** A made-up completed mission for tests. */
export function makeMission(
  over: Partial<Mission> & Pick<Mission, "doneOn">,
): Mission {
  counter += 1;
  return {
    id: `mission-test-${counter}`,
    level: 1,
    questionIds: ["l1-01", "l1-02", "l1-03"],
    correct: 3,
    points: 30,
    completedAt: new Date(),
    ...over,
  };
}

/** The bank question shown on screen right now (found by its text). */
export function currentQuestion(): MissionQuestion {
  const found = missionQuestions.find(
    (q) => screen.queryByText(q.text) !== null,
  );
  if (!found) throw new Error("No mission question is on screen");
  return found;
}

/** Presses the right answer of the current question. */
export async function pressRightAnswer(question = currentQuestion()) {
  const correctOption = question.options.find(
    (option) => option.key === question.correctKey,
  );

  if (!correctOption)
    throw new Error(`No correct option found for ${question.id}`);

  await fireEvent.press(screen.getByText(correctOption.text));
}

/** Presses the first wrong answer of the current question. */
export async function pressWrongAnswer(question = currentQuestion()) {
  const wrongOption = question.options.find(
    (option) => option.key !== question.correctKey,
  );

  if (!wrongOption) throw new Error(`No wrong option found for ${question.id}`);

  await fireEvent.press(screen.getByText(wrongOption.text));
}
