import { describe, expect, test } from "@jest/globals";

import {
  MISSION_POINTS,
  MISSION_QUESTION_COUNT,
  buildMission,
  isDoneOn,
  levelFor,
  missionStreak,
  recentQuestionIds,
  seededRandom,
  totalMissionPoints,
  type Mission,
} from "../features/missions/missions";
import { missionQuestions } from "../features/missions/questions";

const mission = (doneOn: string, over: Partial<Mission> = {}): Mission => ({
  id: `m-${doneOn}`,
  doneOn,
  level: 1,
  questionIds: [],
  correct: 3,
  points: MISSION_POINTS,
  completedAt: new Date(2026, 0, 1),
  ...over,
});

describe("question bank", () => {
  test("contains 300 questions across 100 levels", () => {
    expect(missionQuestions).toHaveLength(300);

    const ids = new Set(missionQuestions.map((q) => q.id));
    expect(ids.size).toBe(300);

    for (let level = 1; level <= 100; level++) {
      expect(missionQuestions.filter((q) => q.level === level)).toHaveLength(3);
    }

    for (const q of missionQuestions) {
      expect(q.text.trim()).not.toBe("");
      expect(q.category.trim()).not.toBe("");
      expect(q.levelTitle.trim()).not.toBe("");
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((option) => option.key)).size).toBe(4);
      expect(q.options.some((option) => option.key === q.correctKey)).toBe(
        true,
      );

      for (const option of q.options) {
        expect(option.text.trim()).not.toBe("");
      }
    }
  });
});

describe("levelFor", () => {
  test("increases one level after each completed mission and stops at 100", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(1)).toBe(2);
    expect(levelFor(9)).toBe(10);
    expect(levelFor(10)).toBe(11);
    expect(levelFor(99)).toBe(100);
    expect(levelFor(200)).toBe(100);
  });
});

describe("seededRandom", () => {
  test("the same seed gives the same sequence, values stay in [0, 1)", () => {
    const a = seededRandom("2026-11-17:1");
    const b = seededRandom("2026-11-17:1");
    const first = [a(), a(), a()];

    expect(first).toEqual([b(), b(), b()]);
    expect(first.every((n) => n >= 0 && n < 1)).toBe(true);
    expect(seededRandom("2026-11-18:1")()).not.toBe(first[0]);
  });
});

describe("buildMission", () => {
  test("picks 3 distinct questions from the current level with 4 options", () => {
    const plan = buildMission("2026-11-17", []);

    expect(plan.level).toBe(1);
    expect(plan.questions).toHaveLength(MISSION_QUESTION_COUNT);
    expect(new Set(plan.questions.map((q) => q.id)).size).toBe(3);

    for (const q of plan.questions) {
      const source = missionQuestions.find((s) => s.id === q.id);

      expect(source).toBeDefined();
      expect(source?.level).toBe(1);
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.options[q.correctIndex]).toBe(
        source?.options.find((option) => option.key === source.correctKey)
          ?.text,
      );
    }
  });

  test("is deterministic for the same day", () => {
    const today = buildMission("2026-11-17", []);

    expect(buildMission("2026-11-17", [])).toEqual(today);
  });

  test("moves to the next level after one completed mission", () => {
    const done = [mission("2026-11-16")];
    const plan = buildMission("2026-11-17", done);

    expect(plan.level).toBe(2);
    expect(
      plan.questions.every((q) => {
        const source = missionQuestions.find((item) => item.id === q.id);
        return source?.level === 2;
      }),
    ).toBe(true);
  });

  test("does not repeat questions from the previous 7 days when fresh questions exist", () => {
    const used = missionQuestions.filter((q) => q.level === 1).map((q) => q.id);

    const done = [
      mission("2026-11-16", {
        level: 1,
        questionIds: used,
      }),
    ];

    expect(recentQuestionIds(done, "2026-11-17")).toEqual(new Set(used));

    const plan = buildMission("2026-11-17", done);

    expect(plan.questions.every((q) => !used.includes(q.id))).toBe(true);
  });

  test("ignores missions older than 7 days for the no-repeat rule", () => {
    const old = [
      mission("2026-11-09", {
        questionIds: ["l1-01"],
      }),
    ];

    expect(recentQuestionIds(old, "2026-11-17").size).toBe(0);
  });

  test("caps progression at level 100", () => {
    const completed = Array.from({ length: 100 }, (_, i) =>
      mission(`2026-08-${String((i % 28) + 1).padStart(2, "0")}`, {
        id: `mission-${i}`,
      }),
    );

    expect(buildMission("2026-11-17", completed).level).toBe(100);
  });
});

describe("streak and points", () => {
  test("counts consecutive days ending today or yesterday", () => {
    expect(missionStreak([], "2026-11-17")).toBe(0);
    expect(missionStreak([mission("2026-11-17")], "2026-11-17")).toBe(1);
    expect(
      missionStreak(
        [mission("2026-11-15"), mission("2026-11-16")],
        "2026-11-17",
      ),
    ).toBe(2);
    expect(
      missionStreak(
        [mission("2026-11-15"), mission("2026-11-16"), mission("2026-11-17")],
        "2026-11-17",
      ),
    ).toBe(3);
  });

  test("a missed day resets the streak", () => {
    expect(
      missionStreak(
        [mission("2026-11-14"), mission("2026-11-15")],
        "2026-11-17",
      ),
    ).toBe(0);
  });

  test("works across month and year boundaries", () => {
    expect(
      missionStreak(
        [mission("2026-12-31"), mission("2027-01-01")],
        "2027-01-01",
      ),
    ).toBe(2);
  });

  test("isDoneOn and totalMissionPoints", () => {
    const done = [mission("2026-11-16"), mission("2026-11-17")];

    expect(isDoneOn(done, "2026-11-17")).toBe(true);
    expect(isDoneOn(done, "2026-11-18")).toBe(false);
    expect(totalMissionPoints(done)).toBe(20);
    expect(totalMissionPoints([])).toBe(0);
  });
});
