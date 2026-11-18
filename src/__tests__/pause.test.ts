import { describe, expect, test } from "@jest/globals";

import {
  pauseImpact,
  pickQuestion,
  pointsForDecision,
  totalPoints,
  validatePauseItem,
  validatePausePrice,
  type Pause,
} from "../features/pause/pause";

const pause = (over: Partial<Pause>): Pause => ({
  id: "p",
  item: "Sneakers",
  price: 400000,
  category: "online_shopping",
  question: 1,
  decision: "wait",
  decidedOn: "2026-11-13",
  decidedAt: new Date(2026, 10, 13),
  entryId: null,
  points: 10,
  ...over,
});

describe("pauseImpact", () => {
  test("safe at and above 20% of the budget left after buying", () => {
    expect(pauseImpact(800000, 600000, 440000)).toEqual({ now: 600000, after: 160000, level: "safe" });
  });
  test("low below 20%, including exactly zero", () => {
    expect(pauseImpact(800000, 600000, 440001).level).toBe("low");
    expect(pauseImpact(800000, 600000, 600000)).toMatchObject({ after: 0, level: "low" });
  });
  test("short when the price is more than jajan left, also when already over", () => {
    expect(pauseImpact(800000, 600000, 600001)).toMatchObject({ after: -1, level: "short" });
    expect(pauseImpact(800000, -50000, 10000)).toMatchObject({ after: -60000, level: "short" });
  });
});

describe("points", () => {
  test("waiting earns 10, buying earns 0", () => {
    expect(pointsForDecision("wait", "2026-11-13", [])).toBe(10);
    expect(pointsForDecision("buy", "2026-11-13", [])).toBe(0);
  });

  test("at most 3 rewarded waits per day; other days and buys do not count", () => {
    const today = "2026-11-13";
    const two = [pause({ id: "a" }), pause({ id: "b" })];
    expect(pointsForDecision("wait", today, two)).toBe(10);
    const three = [...two, pause({ id: "c" })];
    expect(pointsForDecision("wait", today, three)).toBe(0);
    expect(pointsForDecision("wait", "2026-11-14", three)).toBe(10);
    const withBuysAndUnrewarded = [
      pause({ id: "a" }),
      pause({ id: "b", decision: "buy", points: 0 }),
      pause({ id: "c", points: 0 }),
    ];
    expect(pointsForDecision("wait", today, withBuysAndUnrewarded)).toBe(10);
  });

  test("total is the sum of stored points", () => {
    expect(totalPoints([pause({ points: 10 }), pause({ points: 0 }), pause({ points: 10 })])).toBe(20);
    expect(totalPoints([])).toBe(0);
  });
});

describe("step 1 input", () => {
  test("item name is required and trimmed", () => {
    expect(validatePauseItem("   ")).toEqual({ ok: false, error: "Isi nama barangnya dulu, ya." });
    expect(validatePauseItem("  Sneakers ")).toEqual({ ok: true, value: "Sneakers" });
  });
  test("price: required, Rp1 to Rp100.000.000", () => {
    expect(validatePausePrice("")).toEqual({ ok: false, error: "Isi harganya dulu, ya." });
    expect(validatePausePrice("0")).toEqual({ ok: false, error: "Isi harganya dulu, ya." });
    expect(validatePausePrice("400.000")).toEqual({ ok: true, value: 400000 });
    expect(validatePausePrice("100000001")).toEqual({ ok: false, error: "Maksimal Rp100.000.000, ya." });
  });
});

describe("pickQuestion", () => {
  test("returns 1..3", () => {
    expect(pickQuestion(() => 0)).toBe(1);
    expect(pickQuestion(() => 0.5)).toBe(2);
    expect(pickQuestion(() => 0.9999)).toBe(3);
  });
});
