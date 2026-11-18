import {
  nextReachedAt,
  type Deposit,
  type DepositInput,
  type GoalInput,
  type SavingGoal,
} from "@/features/saving/goals";

export type DepositResult = { deposit: Deposit; goal: SavingGoal; justReached: boolean };

/**
 * Storage for saving goals and deposits. Every change that affects a goal's saved amount or
 * target also updates its `reachedAt`, in one transaction. SQLite in the app, in-memory in tests.
 */
export interface SavingStore {
  listGoals(): Promise<SavingGoal[]>;
  listDeposits(): Promise<Deposit[]>;
  createGoal(input: GoalInput): Promise<SavingGoal>;
  updateGoal(id: string, input: GoalInput): Promise<SavingGoal>;
  /** Also deletes the goal's deposits. */
  deleteGoal(id: string): Promise<void>;
  addDeposit(input: DepositInput): Promise<DepositResult>;
  updateDeposit(id: string, input: Pick<Deposit, "goalId" | "amount" | "occurredOn">): Promise<DepositResult>;
  removeDeposit(id: string): Promise<void>;
}

export function createInMemorySavingStore(
  initialGoals: SavingGoal[] = [],
  initialDeposits: Deposit[] = [],
): SavingStore {
  let goals = [...initialGoals];
  let deposits = [...initialDeposits];
  let seq = 0;
  const id = (prefix: string) => `${prefix}-${++seq}`;
  const savedOf = (goalId: string) => deposits.filter((d) => d.goalId === goalId).reduce((s, d) => s + d.amount, 0);

  /** Recomputes reachedAt for a goal; returns the updated goal and whether it just reached. */
  const refresh = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) throw new Error("Goal not found");
    const next = nextReachedAt(goal.reachedAt, savedOf(goalId), goal.target, new Date());
    const updated = { ...goal, reachedAt: next.reachedAt };
    goals = goals.map((g) => (g.id === goalId ? updated : g));
    return { goal: updated, justReached: next.justReached };
  };

  return {
    async listGoals() {
      return [...goals];
    },
    async listDeposits() {
      return [...deposits];
    },
    async createGoal(input) {
      const now = new Date();
      const goal: SavingGoal = { ...input, id: id("goal"), createdAt: now, updatedAt: now, reachedAt: null };
      goals = [...goals, goal];
      return goal;
    },
    async updateGoal(goalId, input) {
      goals = goals.map((g) => (g.id === goalId ? { ...g, ...input, updatedAt: new Date() } : g));
      return refresh(goalId).goal; // a target change never celebrates
    },
    async deleteGoal(goalId) {
      goals = goals.filter((g) => g.id !== goalId);
      deposits = deposits.filter((d) => d.goalId !== goalId);
    },
    async addDeposit(input) {
      const now = new Date();
      const deposit: Deposit = { ...input, id: id("dep"), createdAt: now, updatedAt: now };
      deposits = [...deposits, deposit];
      const { goal, justReached } = refresh(input.goalId);
      return { deposit, goal, justReached };
    },
    async updateDeposit(depositId, input) {
      const before = deposits.find((d) => d.id === depositId);
      if (!before) throw new Error("Deposit not found");
      const deposit: Deposit = { ...before, ...input, updatedAt: new Date() };
      deposits = deposits.map((d) => (d.id === depositId ? deposit : d));
      if (before.goalId !== input.goalId) refresh(before.goalId);
      const { goal, justReached } = refresh(input.goalId);
      return { deposit, goal, justReached };
    },
    async removeDeposit(depositId) {
      const before = deposits.find((d) => d.id === depositId);
      deposits = deposits.filter((d) => d.id !== depositId);
      if (before) refresh(before.goalId);
    },
  };
}
