import { describe, expect, test } from "@jest/globals";

import { jajanStatus } from "../features/home/jajan-left";

describe("jajanStatus", () => {
  test("safe at and above 20% left", () => {
    expect(jajanStatus(800000, 0)).toEqual({ left: 800000, spentShare: 0, mood: "safe" });
    expect(jajanStatus(800000, 640000)).toMatchObject({ left: 160000, mood: "safe" }); // exactly 20%
  });

  test("low below 20% left, including zero left", () => {
    expect(jajanStatus(800000, 640001)).toMatchObject({ left: 159999, mood: "low" });
    expect(jajanStatus(800000, 800000)).toEqual({ left: 0, spentShare: 1, mood: "low" });
  });

  test("over when spending passes the budget; bar is clamped", () => {
    expect(jajanStatus(800000, 825000)).toEqual({ left: -25000, spentShare: 1, mood: "over" });
  });
});
