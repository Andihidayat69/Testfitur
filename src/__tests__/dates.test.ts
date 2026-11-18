import { describe, expect, test } from "@jest/globals";

import { addDays, addMonths, dayLabel, fromLocalDate, monthLabel, monthOf, toLocalDate } from "../lib/dates";

describe("local dates", () => {
  test("toLocalDate uses the local calendar day", () => {
    expect(toLocalDate(new Date(2026, 10, 13, 23, 59))).toBe("2026-11-13");
    expect(toLocalDate(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });

  test("round trip", () => {
    expect(toLocalDate(fromLocalDate("2026-02-28"))).toBe("2026-02-28");
  });

  test("addDays crosses months and years", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  test("months", () => {
    expect(monthOf("2026-11-13")).toBe("2026-11");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(monthLabel("2026-11")).toBe("November 2026");
  });

  test("dayLabel", () => {
    expect(dayLabel("2026-11-13", "2026-11-13")).toBe("Hari ini");
    expect(dayLabel("2026-11-12", "2026-11-13")).toBe("Kemarin");
    expect(dayLabel("2026-10-31", "2026-11-01")).toBe("Kemarin");
    expect(dayLabel("2026-11-02", "2026-11-13")).toBe("2 Nov");
    expect(dayLabel("2025-12-24", "2026-01-05")).toBe("24 Des 2025");
  });
});
