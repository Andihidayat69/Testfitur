
import bank from "./habit-motivation-bank.json";

export type MissionLevel = number;

export type MissionOption = {
  key: string;
  text: string;
};

export type MissionQuestion = {
  id: string;
  level: MissionLevel;
  category: string;
  levelTitle: string;
  text: string;
  options: readonly MissionOption[];
  correctKey: string;
};

export const missionQuestions: readonly MissionQuestion[] = bank.map((q) => {
  if (q.options.length !== 4) {
    throw new Error(`Question ${q.id} must have exactly 4 options`);
  }

  if (!q.options.some((option) => option.key === q.correctKey)) {
    throw new Error(`Invalid answer key in question ${q.id}`);
  }

  return {
    id: q.id,
    level: q.level,
    category: q.category,
    levelTitle: q.levelTitle,
    text: q.text,
    options: q.options,
    correctKey: q.correctKey,
  };
});

if (missionQuestions.length !== 300) {
  throw new Error("Habit Motivation bank must contain 300 questions");
}
