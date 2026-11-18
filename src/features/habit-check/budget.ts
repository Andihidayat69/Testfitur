import { parseRupiahInput } from "@/lib/money";

export const JAJAN_BUDGET_MIN = 1_000;
export const JAJAN_BUDGET_MAX = 100_000_000;
export const jajanBudgetQuickPicks = [500_000, 800_000, 1_000_000];

export type BudgetValidation = { ok: true; value: number } | { ok: false; error: string };

export function validateJajanBudget(input: string): BudgetValidation {
  const value = parseRupiahInput(input);
  if (value === null || value === 0) return { ok: false, error: "Isi kuota jajanmu dulu, ya." };
  if (value < JAJAN_BUDGET_MIN) return { ok: false, error: "Minimal Rp1.000, ya." };
  if (value > JAJAN_BUDGET_MAX) return { ok: false, error: "Maksimal Rp100.000.000, ya." };
  return { ok: true, value };
}
