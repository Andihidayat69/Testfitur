import { describe, expect, test } from "@jest/globals";

import { validateJajanBudget } from "../features/habit-check/budget";

describe("validateJajanBudget", () => {
  test("empty or zero asks the user to fill it in", () => {
    expect(validateJajanBudget("")).toEqual({ ok: false, error: "Isi kuota jajanmu dulu, ya." });
    expect(validateJajanBudget("0")).toEqual({ ok: false, error: "Isi kuota jajanmu dulu, ya." });
    expect(validateJajanBudget("000")).toEqual({ ok: false, error: "Isi kuota jajanmu dulu, ya." });
  });

  test("enforces Rp1.000 to Rp100.000.000", () => {
    expect(validateJajanBudget("999")).toEqual({ ok: false, error: "Minimal Rp1.000, ya." });
    expect(validateJajanBudget("1000")).toEqual({ ok: true, value: 1000 });
    expect(validateJajanBudget("100000000")).toEqual({ ok: true, value: 100000000 });
    expect(validateJajanBudget("100000001")).toEqual({ ok: false, error: "Maksimal Rp100.000.000, ya." });
  });

  test("ignores non-digits and leading zeros", () => {
    expect(validateJajanBudget("Rp 800.000")).toEqual({ ok: true, value: 800000 });
    expect(validateJajanBudget("0800000")).toEqual({ ok: true, value: 800000 });
  });
});
