import type { Entry } from "@/features/expenses/entry";
import { summarizeMonth } from "@/features/expenses/summary";
import { jajanMovedToSaving, type Deposit } from "@/features/saving/goals";

import { jajanStatus } from "./jajan-left";

/**
 * Jajan left for a month: budget − jajan spending − deposits moved from jajan via Pause
 * (docs/specs/home.md and docs/specs/smart-saving.md, Jajan Left and Deposits).
 */
export function jajanForMonth(budget: number, entries: Entry[], deposits: Deposit[], month: string) {
  const summary = summarizeMonth(entries, month);
  const moved = jajanMovedToSaving(deposits, month);
  return { summary, moved, status: jajanStatus(budget, summary.jajanSpent + moved) };
}
