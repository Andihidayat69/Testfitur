
import { describe, expect, test } from "@jest/globals";

import { questions, type Question } from "../features/habit-check/questions";
import { scoreHabitCheck } from "../features/habit-check/scoring";
import type { HabitType } from "../features/habit-check/habit-types";

describe("scoreHabitCheck", () => {
  test("uses the current five-question habit check", () => {
    expect(questions).toHaveLength(5);

    questions.forEach((question) => {
      expect(question.answers).toHaveLength(4);
    });
  });

  test("returns the character selected most frequently", () => {
    const answers = [0, 0, 0, 0, 1];

    expect(questions).toHaveLength(5);

    const expectedCounts = new Map<HabitType, number>();

    answers.forEach((answerIndex, questionIndex) => {
      const character =
        questions[questionIndex].answers[answerIndex].character;

      expectedCounts.set(
        character,
        (expectedCounts.get(character) ?? 0) + 1,
      );
    });

    const expected = [...expectedCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0][0];

    expect(scoreHabitCheck(answers)).toBe(expected);
  });

  test("uses the first selected character when scores are tied", () => {
    const customQuestions: Question[] = [
      {
        id: "q1",
        text: "Question 1",
        answers: [
          { label: "Saver", character: "saver" },
          { label: "Planner", character: "planner" },
          { label: "Impulsive", character: "impulsive" },
          { label: "Balanced", character: "balanced" },
        ],
      },
      {
        id: "q2",
        text: "Question 2",
        answers: [
          { label: "Planner", character: "planner" },
          { label: "Saver", character: "saver" },
          { label: "Impulsive", character: "impulsive" },
          { label: "Balanced", character: "balanced" },
        ],
      },
      {
        id: "q3",
        text: "Question 3",
        answers: [
          { label: "Impulsive", character: "impulsive" },
          { label: "Planner", character: "planner" },
          { label: "Saver", character: "saver" },
          { label: "Balanced", character: "balanced" },
        ],
      },
      {
        id: "q4",
        text: "Question 4",
        answers: [
          { label: "Balanced", character: "balanced" },
          { label: "Planner", character: "planner" },
          { label: "Saver", character: "saver" },
          { label: "Impulsive", character: "impulsive" },
        ],
      },
      {
        id: "q5",
        text: "Question 5",
        answers: [
          { label: "Spontaneous", character: "spontaneous" },
          { label: "Planner", character: "planner" },
          { label: "Saver", character: "saver" },
          { label: "Balanced", character: "balanced" },
        ],
      },
    ];

    // Saver, Planner, Impulsive, Balanced, Spontaneous:
    // All characters receive one vote.
    // Saver appears first, so Saver wins the tie.
    expect(scoreHabitCheck([0, 0, 0, 0, 0], customQuestions)).toBe(
      "saver",
    );
  });

  test("returns a valid habit type for every combination of answers", () => {
    const validHabitTypes: HabitType[] = [
      "planner",
      "saver",
      "impulsive",
      "spontaneous",
      "balanced",
    ];

    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        for (let c = 0; c < 4; c++) {
          for (let d = 0; d < 4; d++) {
            for (let e = 0; e < 4; e++) {
              const result = scoreHabitCheck([a, b, c, d, e]);

              expect(validHabitTypes).toContain(result);
            }
          }
        }
      }
    }
  });

  test("rejects incomplete or excessive answers", () => {
    expect(() => scoreHabitCheck([0, 0, 0, 0])).toThrow();
    expect(() => scoreHabitCheck([0, 0, 0, 0, 0, 0])).toThrow();
  });

  test("rejects invalid answer indexes", () => {
    expect(() => scoreHabitCheck([0, 0, 0, 0, 4])).toThrow();
    expect(() => scoreHabitCheck([-1, 0, 0, 0, 0])).toThrow();
  });
});
