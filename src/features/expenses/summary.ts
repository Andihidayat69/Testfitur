import { monthOf } from "@/lib/dates";

import { expenseCategories, expenseCategoryCodes, isJajanCategory, type ExpenseCategory } from "./categories";
import type { Entry } from "./entry";

export type CategoryTotal = { category: ExpenseCategory; amount: number; share: number };

export type MonthSummary = {
  spending: number;
  income: number;
  difference: number; // income − spending
  jajanSpent: number;
  byCategory: CategoryTotal[]; // largest first; ties follow the category table order
  largestCategory: ExpenseCategory | null;
};

export function entriesInMonth(entries: Entry[], month: string): Entry[] {
  return entries.filter((e) => monthOf(e.occurredOn) === month);
}

export function summarizeMonth(entries: Entry[], month: string): MonthSummary {
  const inMonth = entriesInMonth(entries, month);
  const totals = new Map<ExpenseCategory, number>();
  let spending = 0;
  let income = 0;
  let jajanSpent = 0;

  for (const e of inMonth) {
    if (e.type === "income") {
      income += e.amount;
      continue;
    }
    if (!e.category) continue;
    spending += e.amount;
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    if (isJajanCategory(e.category)) jajanSpent += e.amount;
  }

  const byCategory = expenseCategoryCodes
    .filter((c) => (totals.get(c) ?? 0) > 0)
    .map((c) => ({ category: c, amount: totals.get(c) ?? 0, share: spending ? (totals.get(c) ?? 0) / spending : 0 }))
    .sort((a, b) => b.amount - a.amount); // stable: equal amounts keep table order

  return {
    spending,
    income,
    difference: income - spending,
    jajanSpent,
    byCategory,
    largestCategory: byCategory[0]?.category ?? null,
  };
}

/** Newest first: by date, then by when it was recorded. */
export function sortNewestFirst(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

/** Entries grouped by day, newest day first. */
export function groupByDay(entries: Entry[]): { day: string; entries: Entry[] }[] {
  const groups: { day: string; entries: Entry[] }[] = [];
  for (const e of sortNewestFirst(entries)) {
    const last = groups[groups.length - 1];
    if (last && last.day === e.occurredOn) last.entries.push(e);
    else groups.push({ day: e.occurredOn, entries: [e] });
  }
  return groups;
}

export function categoryName(category: ExpenseCategory): string {
  return expenseCategories[category].name;
}
