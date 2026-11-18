import { describe, expect, test } from "@jest/globals";

import { validateEntryAmount } from "../features/expenses/amount";
import { entryTitle, normalizeNote } from "../features/expenses/entry";
import { groupByDay, sortNewestFirst, summarizeMonth } from "../features/expenses/summary";
import { makeEntry } from "../test-utils/entries";

describe("summarizeMonth", () => {
  const entries = [
    makeEntry({ occurredOn: "2026-11-01", category: "food_snacks", amount: 45000 }),
    makeEntry({ occurredOn: "2026-11-30", category: "online_shopping", amount: 145000 }),
    makeEntry({ occurredOn: "2026-11-15", category: "transport", amount: 20000 }),
    makeEntry({ occurredOn: "2026-11-15", category: "bills", amount: 300000 }),
    makeEntry({ occurredOn: "2026-11-20", category: "entertainment", amount: 55000 }),
    makeEntry({ occurredOn: "2026-11-25", type: "income", amount: 3000000 }),
    makeEntry({ occurredOn: "2026-10-31", category: "food_snacks", amount: 99000 }), // last month
    makeEntry({ occurredOn: "2026-12-01", category: "food_snacks", amount: 77000 }), // next month
  ];

  test("totals only the given month, first to last day", () => {
    const s = summarizeMonth(entries, "2026-11");
    expect(s.spending).toBe(45000 + 145000 + 20000 + 300000 + 55000);
    expect(s.income).toBe(3000000);
    expect(s.difference).toBe(3000000 - 565000);
  });

  test("jajan spent counts only Makan & jajan, Belanja online and Hiburan", () => {
    expect(summarizeMonth(entries, "2026-11").jajanSpent).toBe(45000 + 145000 + 55000);
  });

  test("categories largest first with shares; largest category", () => {
    const s = summarizeMonth(entries, "2026-11");
    expect(s.byCategory.map((c) => c.category)).toEqual([
      "bills",
      "online_shopping",
      "entertainment",
      "food_snacks",
      "transport",
    ]);
    expect(s.byCategory[0].share).toBeCloseTo(300000 / 565000);
    expect(s.largestCategory).toBe("bills");
  });

  test("ties follow the category table order", () => {
    const tie = [
      makeEntry({ occurredOn: "2026-11-02", category: "entertainment", amount: 50000 }),
      makeEntry({ occurredOn: "2026-11-02", category: "food_snacks", amount: 50000 }),
    ];
    expect(summarizeMonth(tie, "2026-11").largestCategory).toBe("food_snacks");
  });

  test("empty month", () => {
    const s = summarizeMonth(entries, "2026-09");
    expect(s).toEqual({ spending: 0, income: 0, difference: 0, jajanSpent: 0, byCategory: [], largestCategory: null });
  });
});

describe("ordering", () => {
  test("newest first by date, then by recording time", () => {
    const a = makeEntry({ occurredOn: "2026-11-10" }, new Date(2026, 10, 10, 9));
    const b = makeEntry({ occurredOn: "2026-11-12" }, new Date(2026, 10, 12, 8));
    const c = makeEntry({ occurredOn: "2026-11-12" }, new Date(2026, 10, 12, 20));
    expect(sortNewestFirst([a, b, c]).map((e) => e.id)).toEqual([c.id, b.id, a.id]);
    expect(groupByDay([a, b, c]).map((g) => [g.day, g.entries.length])).toEqual([
      ["2026-11-12", 2],
      ["2026-11-10", 1],
    ]);
  });
});

describe("entry input", () => {
  test("amount validation", () => {
    expect(validateEntryAmount("")).toEqual({ ok: false, error: "Isi nominalnya dulu, ya." });
    expect(validateEntryAmount("0")).toEqual({ ok: false, error: "Isi nominalnya dulu, ya." });
    expect(validateEntryAmount("1")).toEqual({ ok: true, value: 1 });
    expect(validateEntryAmount("100000000")).toEqual({ ok: true, value: 100000000 });
    expect(validateEntryAmount("100000001")).toEqual({ ok: false, error: "Maksimal Rp100.000.000, ya." });
  });

  test("note is trimmed, spaces-only becomes empty, capped at 40", () => {
    expect(normalizeNote("  Kopi susu  ")).toBe("Kopi susu");
    expect(normalizeNote("   ")).toBeNull();
    expect(normalizeNote("x".repeat(50))).toHaveLength(40);
  });

  test("title falls back to the category name or Pemasukan", () => {
    expect(entryTitle({ type: "expense", category: "transport", note: null })).toBe("Transportasi");
    expect(entryTitle({ type: "income", category: null, note: null })).toBe("Pemasukan");
    expect(entryTitle({ type: "expense", category: "transport", note: "Ojek" })).toBe("Ojek");
  });
});
