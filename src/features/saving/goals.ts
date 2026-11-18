import { validateEntryAmount } from "@/features/expenses/amount";
import { parseRupiahInput } from "@/lib/money";

export const goalIconCodes = ["smartphone", "music", "map", "gift", "book", "shield", "home", "star"] as const;
export type GoalIcon = (typeof goalIconCodes)[number];
export const DEFAULT_GOAL_ICON: GoalIcon = "star";

/** Accessible names for the icon chips (docs/specs/smart-saving.md). */
export const goalIconLabels: Record<GoalIcon, string> = {
  smartphone: "Gadget",
  music: "Konser",
  map: "Liburan",
  gift: "Hadiah",
  book: "Belajar",
  shield: "Dana darurat",
  home: "Rumah",
  star: "Lainnya",
};

export type SavingGoal = {
  id: string;
  name: string;
  icon: GoalIcon;
  target: number; // integer rupiah
  createdAt: Date;
  updatedAt: Date;
  reachedAt: Date | null; // when deposits first reached the target
};

export type DepositSource = "manual" | "pause";

export type Deposit = {
  id: string;
  goalId: string;
  amount: number; // integer rupiah, > 0
  occurredOn: string; // local YYYY-MM-DD
  source: DepositSource;
  pauseId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GoalInput = Pick<SavingGoal, "name" | "icon" | "target">;
export type DepositInput = Pick<Deposit, "goalId" | "amount" | "occurredOn" | "source" | "pauseId">;

// --- Progress ---

export function savedByGoal(deposits: Deposit[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of deposits) map.set(d.goalId, (map.get(d.goalId) ?? 0) + d.amount);
  return map;
}

export function totalSaved(deposits: Deposit[]): number {
  return deposits.reduce((sum, d) => sum + d.amount, 0);
}

export type GoalProgress = { saved: number; share: number; remaining: number; reached: boolean; percent: number };

export function goalProgress(target: number, saved: number): GoalProgress {
  const share = target > 0 ? Math.min(1, saved / target) : 1;
  return {
    saved,
    share,
    remaining: Math.max(0, target - saved),
    reached: saved >= target,
    percent: Math.floor(share * 100),
  };
}

const byCreated = (a: SavingGoal, b: SavingGoal) =>
  a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id);

/** The oldest goal that has not reached its target, or null. */
export function mainGoal(goals: SavingGoal[], saved: Map<string, number>): SavingGoal | null {
  return [...goals].sort(byCreated).find((g) => (saved.get(g.id) ?? 0) < g.target) ?? null;
}

/** Unfinished goals first (oldest first), then reached ones (oldest first). */
export function sortGoals(goals: SavingGoal[], saved: Map<string, number>): SavingGoal[] {
  const reached = (g: SavingGoal) => (saved.get(g.id) ?? 0) >= g.target;
  return [...goals].sort((a, b) => Number(reached(a)) - Number(reached(b)) || byCreated(a, b));
}

/**
 * The goal's next `reachedAt` after its saved amount or target changed. Returns `justReached`
 * when a deposit change made it reach the target (the one-time celebration).
 */
export function nextReachedAt(
  current: Date | null,
  saved: number,
  target: number,
  now: Date,
): { reachedAt: Date | null; justReached: boolean } {
  if (saved >= target) return current ? { reachedAt: current, justReached: false } : { reachedAt: now, justReached: true };
  return { reachedAt: null, justReached: false };
}

// --- Jajan moved to saving ---

/** Deposits from Pause Before Buying in a month: they reduce jajan left (docs/specs/smart-saving.md). */
export function jajanMovedToSaving(deposits: Deposit[], month: string): number {
  return deposits
    .filter((d) => d.source === "pause" && d.occurredOn.slice(0, 7) === month)
    .reduce((sum, d) => sum + d.amount, 0);
}

// --- Validation ---

export const GOAL_NAME_MAX_LENGTH = 30;
export const GOAL_TARGET_MIN = 1_000;
export const GOAL_TARGET_MAX = 100_000_000;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateGoalName(name: string): Result<string> {
  const value = name.trim().slice(0, GOAL_NAME_MAX_LENGTH);
  return value ? { ok: true, value } : { ok: false, error: "Isi nama tujuannya dulu, ya." };
}

export function validateGoalTarget(input: string): Result<number> {
  const value = parseRupiahInput(input);
  if (value === null || value === 0) return { ok: false, error: "Isi targetnya dulu, ya." };
  if (value < GOAL_TARGET_MIN) return { ok: false, error: "Minimal Rp1.000, ya." };
  if (value > GOAL_TARGET_MAX) return { ok: false, error: "Maksimal Rp100.000.000, ya." };
  return { ok: true, value };
}

/** Same rules and texts as expense amounts. */
export const validateDepositAmount = validateEntryAmount;
