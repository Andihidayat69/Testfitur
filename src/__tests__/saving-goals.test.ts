import { describe, expect, test } from "@jest/globals";

import { jajanForMonth } from "../features/home/jajan";
import {
  goalProgress,
  jajanMovedToSaving,
  mainGoal,
  nextReachedAt,
  savedByGoal,
  sortGoals,
  totalSaved,
  validateGoalName,
  validateGoalTarget,
} from "../features/saving/goals";
import { makeDeposit, makeEntry, makeGoal } from "../test-utils/entries";

describe("progress", () => {
  test("saved, share, remaining, reached; over-target caps at 100%", () => {
    expect(goalProgress(500000, 300000)).toEqual({ saved: 300000, share: 0.6, remaining: 200000, reached: false, percent: 60 });
    expect(goalProgress(500000, 500000)).toMatchObject({ remaining: 0, reached: true, percent: 100 });
    expect(goalProgress(500000, 650000)).toMatchObject({ share: 1, remaining: 0, reached: true, percent: 100 });
    expect(goalProgress(300000, 299999).percent).toBe(99); // never rounds up to 100 before reaching
  });

  test("saved per goal and total", () => {
    const deposits = [
      makeDeposit({ goalId: "a", amount: 100000, occurredOn: "2026-11-01" }),
      makeDeposit({ goalId: "a", amount: 50000, occurredOn: "2026-11-02" }),
      makeDeposit({ goalId: "b", amount: 70000, occurredOn: "2026-11-02" }),
    ];
    expect(savedByGoal(deposits).get("a")).toBe(150000);
    expect(totalSaved(deposits)).toBe(220000);
  });
});

describe("main goal and order", () => {
  const older = makeGoal({ id: "older", createdAt: new Date(2026, 0, 1), target: 100000 });
  const newer = makeGoal({ id: "newer", createdAt: new Date(2026, 5, 1), target: 100000 });
  const sameTimeB = makeGoal({ id: "b-same", createdAt: new Date(2026, 2, 1) });
  const sameTimeA = makeGoal({ id: "a-same", createdAt: new Date(2026, 2, 1) });

  test("oldest unfinished goal; skips reached ones; null when none", () => {
    expect(mainGoal([newer, older], new Map())).toBe(older);
    expect(mainGoal([newer, older], new Map([["older", 100000]]))).toBe(newer);
    expect(mainGoal([newer, older], new Map([["older", 100000], ["newer", 120000]]))).toBeNull();
    expect(mainGoal([], new Map())).toBeNull();
  });

  test("ties on creation time break by id", () => {
    expect(mainGoal([sameTimeB, sameTimeA], new Map())?.id).toBe("a-same");
  });

  test("unfinished first, then reached", () => {
    expect(sortGoals([older, newer], new Map([["older", 100000]])).map((g) => g.id)).toEqual(["newer", "older"]);
  });
});

describe("reachedAt", () => {
  const now = new Date(2026, 10, 13);
  test("first time reaching celebrates; staying reached does not", () => {
    expect(nextReachedAt(null, 500000, 500000, now)).toEqual({ reachedAt: now, justReached: true });
    const earlier = new Date(2026, 10, 1);
    expect(nextReachedAt(earlier, 600000, 500000, now)).toEqual({ reachedAt: earlier, justReached: false });
  });
  test("dropping below the target clears it so it can celebrate again", () => {
    expect(nextReachedAt(new Date(), 499999, 500000, now)).toEqual({ reachedAt: null, justReached: false });
  });
});

describe("jajan left with deposits", () => {
  const entries = [makeEntry({ occurredOn: "2026-11-05", category: "food_snacks", amount: 100000 })];
  const deposits = [
    makeDeposit({ goalId: "a", amount: 400000, occurredOn: "2026-11-10", source: "pause", pauseId: "p1" }),
    makeDeposit({ goalId: "a", amount: 300000, occurredOn: "2026-11-10", source: "manual" }), // from income
    makeDeposit({ goalId: "a", amount: 50000, occurredOn: "2026-10-31", source: "pause", pauseId: "p0" }), // last month
  ];

  test("only this month's Pause deposits reduce jajan left", () => {
    expect(jajanMovedToSaving(deposits, "2026-11")).toBe(400000);
    const { status, moved } = jajanForMonth(800000, entries, deposits, "2026-11");
    expect(moved).toBe(400000);
    expect(status.left).toBe(800000 - 100000 - 400000);
  });

  test("manual deposits never reduce it; deleting a Pause deposit gives it back", () => {
    const withoutPause = deposits.filter((d) => d.source === "manual");
    expect(jajanForMonth(800000, entries, withoutPause, "2026-11").status.left).toBe(700000);
  });

  test("moving a Pause deposit to another month moves the reduction with it", () => {
    const moved = [{ ...deposits[0], occurredOn: "2026-12-01" }];
    expect(jajanForMonth(800000, entries, moved, "2026-11").status.left).toBe(700000);
    expect(jajanForMonth(800000, [], moved, "2026-12").status.left).toBe(400000);
  });
});

describe("validation", () => {
  test("goal name", () => {
    expect(validateGoalName("  ")).toEqual({ ok: false, error: "Isi nama tujuannya dulu, ya." });
    expect(validateGoalName(" HP baru ")).toEqual({ ok: true, value: "HP baru" });
    expect((validateGoalName("x".repeat(40)) as { value: string }).value).toHaveLength(30);
  });
  test("goal target Rp1.000 to Rp100.000.000", () => {
    expect(validateGoalTarget("")).toEqual({ ok: false, error: "Isi targetnya dulu, ya." });
    expect(validateGoalTarget("999")).toEqual({ ok: false, error: "Minimal Rp1.000, ya." });
    expect(validateGoalTarget("4.000.000")).toEqual({ ok: true, value: 4000000 });
    expect(validateGoalTarget("100000001")).toEqual({ ok: false, error: "Maksimal Rp100.000.000, ya." });
  });
});
