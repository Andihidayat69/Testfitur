
// Daily Habit Mission logic.
// Supports 100 levels, 3 questions per mission, and 4 answer options.

import { addDays } from "@/lib/dates";

import {
  missionQuestions,
  type MissionLevel,
  type MissionQuestion,
} from "./questions";

export const MISSION_QUESTION_COUNT = 3;
export const MISSION_POINTS = 10;
export const NO_REPEAT_DAYS = 7;
export const MAX_MISSION_LEVEL = 100;

/** One completed daily mission. At most one per local day. */
export type Mission = {
  id: string;
  doneOn: string;
  level: MissionLevel;
  questionIds: string[];
  correct: number;
  points: number;
  completedAt: Date;
};

export type MissionInput = Pick<
  Mission,
  "doneOn" | "level" | "questionIds" | "correct"
>;

// --- Level ---

/** Each completed mission advances one level, up to level 100. */
export function levelFor(completedCount: number): MissionLevel {
  return Math.min(
    Math.max(1, Math.floor(completedCount) + 1),
    MAX_MISSION_LEVEL,
  );
}

// --- Seeded randomness ---

function hashSeed(seed: string): number {
  let h = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

export function seededRandom(seed: string): () => number {
  let a = hashSeed(seed);

  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// --- Building a mission ---

export type PresentedQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type MissionPlan = {
  level: MissionLevel;
  questions: PresentedQuestion[];
};

/** Questions used during the previous 7 days. */
export function recentQuestionIds(
  missions: Mission[],
  today: string,
): Set<string> {
  const from = addDays(today, -NO_REPEAT_DAYS);
  const ids = new Set<string>();

  for (const mission of missions) {
    if (mission.doneOn >= from && mission.doneOn < today) {
      mission.questionIds.forEach((id) => ids.add(id));
    }
  }

  return ids;
}

function present(
  question: MissionQuestion,
  random: () => number,
): PresentedQuestion {
  const shuffledOptions = shuffle(question.options, random);
  const options = shuffledOptions.map((option) => option.text);

  return {
    id: question.id,
    text: question.text,
    options,
    correctIndex: shuffledOptions.findIndex(
      (option) => option.key === question.correctKey,
    ),
    // The supplied question bank does not contain explanations.
    explanation: "",
  };
}

/**
 * Selects 3 questions for the current level.
 *
 * Priority:
 * 1. Fresh questions from the current level.
 * 2. Fresh questions from other levels.
 * 3. Previously used questions only if fewer than 3 fresh questions exist.
 *
 * Questions used during the previous 7 days are avoided whenever possible.
 */
export function buildMission(
  today: string,
  completed: Mission[],
  bank: readonly MissionQuestion[] = missionQuestions,
): MissionPlan {
  const level = levelFor(completed.length);
  const recent = recentQuestionIds(completed, today);
  const random = seededRandom(`${today}:${level}`);

  // First priority: unused questions from the current level.
  const currentLevelFresh = shuffle(
    bank.filter(
      (question) =>
        question.level === level && !recent.has(question.id),
    ),
    random,
  );

  // Second priority: unused questions from other levels.
  const otherLevelFresh = shuffle(
    bank.filter(
      (question) =>
        question.level !== level && !recent.has(question.id),
    ),
    random,
  );

  const freshQuestions = [
    ...currentLevelFresh,
    ...otherLevelFresh,
  ];

  // Use old questions only if fresh questions are insufficient.
  let selectedQuestions = freshQuestions.slice(
    0,
    MISSION_QUESTION_COUNT,
  );

  if (selectedQuestions.length < MISSION_QUESTION_COUNT) {
    const selectedIds = new Set(
      selectedQuestions.map((question) => question.id),
    );

    const repeatQuestions = shuffle(
      bank.filter((question) => !selectedIds.has(question.id)),
      random,
    );

    const remainingCount =
      MISSION_QUESTION_COUNT - selectedQuestions.length;

    selectedQuestions = [
      ...selectedQuestions,
      ...repeatQuestions.slice(0, remainingCount),
    ];
  }

  if (selectedQuestions.length < MISSION_QUESTION_COUNT) {
    throw new Error("Not enough questions to build a daily mission");
  }

  return {
    level,
    questions: selectedQuestions.map((question) =>
      present(question, random),
    ),
  };
}

// --- Streak and points ---

export function isDoneOn(missions: Mission[], date: string): boolean {
  return missions.some((mission) => mission.doneOn === date);
}

export function missionStreak(
  missions: Mission[],
  today: string,
): number {
  const days = new Set(missions.map((mission) => mission.doneOn));

  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;

  while (days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }

  return count;
}

export function totalMissionPoints(missions: Mission[]): number {
  return missions.reduce((sum, mission) => sum + mission.points, 0);
}
