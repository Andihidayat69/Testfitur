import { eq, sum } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";

import { nextReachedAt, type Deposit, type SavingGoal } from "@/features/saving/goals";

import type { SavingStore } from "./saving-store";
import * as schema from "./schema";

type Db = ExpoSQLiteDatabase<typeof schema>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Recomputes a goal's reachedAt inside a transaction. */
async function refreshGoal(tx: Tx, goalId: string): Promise<{ goal: SavingGoal; justReached: boolean }> {
  const goal = await tx.select().from(schema.goals).where(eq(schema.goals.id, goalId)).get();
  if (!goal) throw new Error("Goal not found");
  const row = await tx
    .select({ saved: sum(schema.deposits.amount) })
    .from(schema.deposits)
    .where(eq(schema.deposits.goalId, goalId))
    .get();
  const saved = Number(row?.saved ?? 0);
  const next = nextReachedAt(goal.reachedAt, saved, goal.target, new Date());
  if ((next.reachedAt?.getTime() ?? null) !== (goal.reachedAt?.getTime() ?? null)) {
    await tx.update(schema.goals).set({ reachedAt: next.reachedAt }).where(eq(schema.goals.id, goalId));
  }
  return { goal: { ...goal, reachedAt: next.reachedAt }, justReached: next.justReached };
}

export function createSqliteSavingStore(db: Db): SavingStore {
  return {
    async listGoals() {
      return (await db.select().from(schema.goals).all()).map((g) => ({ ...g }));
    },
    async listDeposits() {
      return (await db.select().from(schema.deposits).all()).map((d) => ({ ...d }));
    },
    async createGoal(input) {
      const now = new Date();
      const goal: SavingGoal = { ...input, id: Crypto.randomUUID(), createdAt: now, updatedAt: now, reachedAt: null };
      await db.insert(schema.goals).values(goal);
      return goal;
    },
    async updateGoal(id, input) {
      return db.transaction(async (tx) => {
        await tx.update(schema.goals).set({ ...input, updatedAt: new Date() }).where(eq(schema.goals.id, id));
        return (await refreshGoal(tx, id)).goal; // a target change never celebrates
      });
    },
    async deleteGoal(id) {
      await db.delete(schema.goals).where(eq(schema.goals.id, id)); // deposits cascade
    },
    async addDeposit(input) {
      const now = new Date();
      const deposit: Deposit = { ...input, id: Crypto.randomUUID(), createdAt: now, updatedAt: now };
      return db.transaction(async (tx) => {
        await tx.insert(schema.deposits).values(deposit);
        const { goal, justReached } = await refreshGoal(tx, input.goalId);
        return { deposit, goal, justReached };
      });
    },
    async updateDeposit(id, input) {
      return db.transaction(async (tx) => {
        const before = await tx.select().from(schema.deposits).where(eq(schema.deposits.id, id)).get();
        if (!before) throw new Error("Deposit not found");
        const deposit: Deposit = { ...before, ...input, updatedAt: new Date() };
        await tx
          .update(schema.deposits)
          .set({ goalId: input.goalId, amount: input.amount, occurredOn: input.occurredOn, updatedAt: deposit.updatedAt })
          .where(eq(schema.deposits.id, id));
        if (before.goalId !== input.goalId) await refreshGoal(tx, before.goalId);
        const { goal, justReached } = await refreshGoal(tx, input.goalId);
        return { deposit, goal, justReached };
      });
    },
    async removeDeposit(id) {
      await db.transaction(async (tx) => {
        const before = await tx.select().from(schema.deposits).where(eq(schema.deposits.id, id)).get();
        await tx.delete(schema.deposits).where(eq(schema.deposits.id, id));
        if (before) await refreshGoal(tx, before.goalId);
      });
    },
  };
}
