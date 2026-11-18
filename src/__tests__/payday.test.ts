import { describe, expect, test } from "@jest/globals";

import {
  isValidPaydayDay,
  latestPayday,
  nextPaydayTimes,
  paydayIn,
  paydayPopupFor,
  validatePaydayAmount,
} from "../features/payday/payday";

describe("paydayIn", () => {
  test("the chosen day, or the last day of a shorter month", () => {
    expect(paydayIn("2026-11", 25)).toBe("2026-11-25");
    expect(paydayIn("2026-02", 31)).toBe("2026-02-28");
    expect(paydayIn("2028-02", 30)).toBe("2028-02-29"); // leap year
    expect(paydayIn("2026-04", 31)).toBe("2026-04-30");
    expect(paydayIn("2026-01", 31)).toBe("2026-01-31");
  });
});

describe("latestPayday", () => {
  test("this month's payday once it has come, otherwise last month's", () => {
    expect(latestPayday("2026-11-25", 25)).toBe("2026-11-25");
    expect(latestPayday("2026-11-24", 25)).toBe("2026-10-25");
    expect(latestPayday("2026-03-02", 31)).toBe("2026-02-28");
    expect(latestPayday("2026-01-03", 28)).toBe("2025-12-28");
  });
});

describe("paydayPopupFor", () => {
  const reminder = { day: 25, saveAmount: 300000 };
  test("payday and the 3 days after", () => {
    expect(paydayPopupFor("2026-11-24", reminder, null)).toBeNull();
    expect(paydayPopupFor("2026-11-25", reminder, null)).toBe("2026-11-25");
    expect(paydayPopupFor("2026-11-28", reminder, null)).toBe("2026-11-25");
    expect(paydayPopupFor("2026-11-29", reminder, null)).toBeNull();
  });
  test("once per payday; back next month", () => {
    expect(paydayPopupFor("2026-11-26", reminder, "2026-11-25")).toBeNull();
    expect(paydayPopupFor("2026-12-25", reminder, "2026-11-25")).toBe("2026-12-25");
  });
  test("window crosses the month end", () => {
    expect(paydayPopupFor("2026-12-02", { day: 30, saveAmount: 1 }, null)).toBe("2026-11-30");
  });
  test("no reminder, no pop-up", () => {
    expect(paydayPopupFor("2026-11-25", null, null)).toBeNull();
  });
});

describe("nextPaydayTimes", () => {
  test("next 3 paydays at 09:00, skipping today's if it has passed", () => {
    const morning = nextPaydayTimes(new Date(2026, 10, 25, 8, 0), 25);
    expect(morning.map((d) => [d.getMonth() + 1, d.getDate(), d.getHours()])).toEqual([
      [11, 25, 9],
      [12, 25, 9],
      [1, 25, 9],
    ]);
    const afternoon = nextPaydayTimes(new Date(2026, 10, 25, 10, 0), 25);
    expect(afternoon[0].getMonth() + 1).toBe(12);
  });
  test("short months use the last day", () => {
    const times = nextPaydayTimes(new Date(2026, 0, 31, 12, 0), 31);
    expect(times.map((d) => `${d.getMonth() + 1}-${d.getDate()}`)).toEqual(["2-28", "3-31", "4-30"]);
  });
});

describe("validation", () => {
  test("amount Rp1.000 to Rp100.000.000", () => {
    expect(validatePaydayAmount("")).toEqual({ ok: false, error: "Isi nominalnya dulu, ya." });
    expect(validatePaydayAmount("999")).toEqual({ ok: false, error: "Minimal Rp1.000, ya." });
    expect(validatePaydayAmount("300.000")).toEqual({ ok: true, value: 300000 });
    expect(validatePaydayAmount("100000001")).toEqual({ ok: false, error: "Maksimal Rp100.000.000, ya." });
  });
  test("day 1 to 31", () => {
    expect(isValidPaydayDay(null)).toBe(false);
    expect(isValidPaydayDay(0)).toBe(false);
    expect(isValidPaydayDay(1)).toBe(true);
    expect(isValidPaydayDay(31)).toBe(true);
    expect(isValidPaydayDay(32)).toBe(false);
  });
});
