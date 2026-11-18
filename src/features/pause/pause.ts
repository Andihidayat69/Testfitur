import { validateEntryAmount } from "@/features/expenses/amount";
import type { ExpenseCategory } from "@/features/expenses/categories";
import { LOW_THRESHOLD } from "@/features/home/jajan-left";

export type PauseDecision = "wait" | "buy";

/** Jajan categories a pause can use (docs/specs/pause-before-buying.md). */
export const pauseCategories = ["food_snacks", "online_shopping", "entertainment"] as const satisfies readonly ExpenseCategory[];
export type PauseCategory = (typeof pauseCategories)[number];
export const DEFAULT_PAUSE_CATEGORY: PauseCategory = "online_shopping";

export const reflectionQuestions = [
  "Butuh sekarang, atau cuma pengin?",
  "Besok kamu masih mau ini?",
  "Kalau batal, uangnya buat apa?",
] as const;

/** 1-based question number, picked at random when a pause starts. */
export function pickQuestion(random: () => number = Math.random): number {
  return Math.min(reflectionQuestions.length, Math.floor(random() * reflectionQuestions.length) + 1);
}

export type Pause = {
  id: string;
  item: string;
  price: number; // integer rupiah
  category: PauseCategory;
  question: number; // 1..3
  decision: PauseDecision;
  decidedOn: string; // local YYYY-MM-DD
  decidedAt: Date;
  entryId: string | null; // the expense recorded for "buy"
  points: number;
};

export type PauseDecisionInput = Pick<Pause, "item" | "price" | "category" | "question" | "decision" | "decidedOn">;

// --- Impact (step 2) ---

export type PauseImpact = { now: number; after: number; level: "safe" | "low" | "short" };

export function pauseImpact(budget: number, jajanLeft: number, price: number): PauseImpact {
  const after = jajanLeft - price;
  const level = after < 0 ? "short" : after < budget * LOW_THRESHOLD ? "low" : "safe";
  return { now: jajanLeft, after, level };
}

export const impactContent: Record<PauseImpact["level"], { note: string; icon: string; mascot: "berpikir" | "kaget" }> = {
  safe: { note: "Masih aman sampai akhir bulan.", icon: "check-circle", mascot: "berpikir" },
  low: { note: "Tinggal sedikit sampai akhir bulan.", icon: "alert-circle", mascot: "kaget" },
  short: { note: "Sisa jajanmu nggak cukup buat ini.", icon: "alert-triangle", mascot: "kaget" },
};

// --- Points ---

export const POINTS_PER_WAIT = 10;
export const MAX_REWARDED_WAITS_PER_DAY = 3;

/** Points a new decision earns, given the pauses already saved. */
export function pointsForDecision(decision: PauseDecision, decidedOn: string, existing: Pause[]): number {
  if (decision !== "wait") return 0;
  const rewardedToday = existing.filter((p) => p.decidedOn === decidedOn && p.decision === "wait" && p.points > 0).length;
  return rewardedToday < MAX_REWARDED_WAITS_PER_DAY ? POINTS_PER_WAIT : 0;
}

export function totalPoints(pauses: Pause[]): number {
  return pauses.reduce((sum, p) => sum + p.points, 0);
}

// --- Step 1 validation ---

export const ITEM_MAX_LENGTH = 40;

export function validatePauseItem(item: string): { ok: true; value: string } | { ok: false; error: string } {
  const value = item.trim().slice(0, ITEM_MAX_LENGTH);
  return value === "" ? { ok: false, error: "Isi nama barangnya dulu, ya." } : { ok: true, value };
}

export function validatePausePrice(input: string): { ok: true; value: number } | { ok: false; error: string } {
  const result = validateEntryAmount(input);
  if (!result.ok && result.error === "Isi nominalnya dulu, ya.") return { ok: false, error: "Isi harganya dulu, ya." };
  return result;
}
