import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { DepositResult, SavingStore } from "@/db/saving-store";
import type { Deposit, DepositInput, GoalInput, SavingGoal } from "@/features/saving/goals";

type SavingsContextValue = {
  goals: SavingGoal[];
  deposits: Deposit[];
  createGoal: (input: GoalInput) => Promise<SavingGoal>;
  updateGoal: (id: string, input: GoalInput) => Promise<SavingGoal>;
  deleteGoal: (id: string) => Promise<void>;
  addDeposit: (input: DepositInput) => Promise<DepositResult>;
  updateDeposit: (id: string, input: Pick<Deposit, "goalId" | "amount" | "occurredOn">) => Promise<DepositResult>;
  removeDeposit: (id: string) => Promise<void>;
};

const SavingsContext = createContext<SavingsContextValue | null>(null);

export function SavingsProvider({
  store,
  initialGoals,
  initialDeposits,
  children,
}: {
  store: SavingStore;
  initialGoals: SavingGoal[];
  initialDeposits: Deposit[];
  children: ReactNode;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [deposits, setDeposits] = useState(initialDeposits);

  // Goals' reachedAt can change with any deposit change, so reload both from the store.
  const reload = useCallback(async () => {
    const [g, d] = await Promise.all([store.listGoals(), store.listDeposits()]);
    setGoals(g);
    setDeposits(d);
  }, [store]);

  const createGoal = useCallback(
    async (input: GoalInput) => {
      const goal = await store.createGoal(input);
      setGoals((prev) => [...prev, goal]);
      return goal;
    },
    [store],
  );
  const updateGoal = useCallback(
    async (id: string, input: GoalInput) => {
      const goal = await store.updateGoal(id, input);
      setGoals((prev) => prev.map((g) => (g.id === id ? goal : g)));
      return goal;
    },
    [store],
  );
  const deleteGoal = useCallback(
    async (id: string) => {
      await store.deleteGoal(id);
      await reload();
    },
    [store, reload],
  );
  const addDeposit = useCallback(
    async (input: DepositInput) => {
      const result = await store.addDeposit(input);
      await reload();
      return result;
    },
    [store, reload],
  );
  const updateDeposit = useCallback(
    async (id: string, input: Pick<Deposit, "goalId" | "amount" | "occurredOn">) => {
      const result = await store.updateDeposit(id, input);
      await reload();
      return result;
    },
    [store, reload],
  );
  const removeDeposit = useCallback(
    async (id: string) => {
      await store.removeDeposit(id);
      await reload();
    },
    [store, reload],
  );

  const value = useMemo(
    () => ({ goals, deposits, createGoal, updateGoal, deleteGoal, addDeposit, updateDeposit, removeDeposit }),
    [goals, deposits, createGoal, updateGoal, deleteGoal, addDeposit, updateDeposit, removeDeposit],
  );
  return <SavingsContext.Provider value={value}>{children}</SavingsContext.Provider>;
}

export function useSavings(): SavingsContextValue {
  const value = useContext(SavingsContext);
  if (!value) throw new Error("useSavings must be used inside SavingsProvider");
  return value;
}
