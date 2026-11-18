
import bank from "./habit-check-bank.json";
import type { HabitType } from "./habit-types";

export type Answer = {
  label: string;
  character: HabitType;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

const characterMap: Record<string, HabitType> = {
  "The Planner": "planner",
  "The Saver": "saver",
  "The Impulsive": "impulsive",
  "The Spontaneous": "spontaneous",
  "The Balanced": "balanced",
};

export const questions: Question[] = bank.map((question) => ({
  id: question.id,
  text: question.text,
  answers: question.options.map((option) => {
    const character = characterMap[option.character];

    if (!character) {
      throw new Error(`Unknown habit character: ${option.character}`);
    }

    return {
      label: option.text,
      character,
    };
  }),
}));
