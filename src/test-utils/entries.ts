import type { Deposit, SavingGoal } from "@/features/saving/goals";
import type { Entry, EntryInput } from "@/features/expenses/entry";

let counter = 0;

/** Builds a made-up entry for tests. */
export function makeEntry(input: Partial<EntryInput> & Pick<EntryInput, "occurredOn">, createdAt = new Date()): Entry {
  counter += 1;
  return {
    id: `test-${counter}`,
    type: input.type ?? "expense",
    amount: input.amount ?? 10000,
    category: input.type === "income" ? null : (input.category ?? "food_snacks"),
    note: input.note ?? null,
    occurredOn: input.occurredOn,
    createdAt,
    updatedAt: createdAt,
  };
}


/** A made-up saving goal for tests. */
export function makeGoal(over: Partial<SavingGoal> & Pick<SavingGoal, "id">): SavingGoal {
  return {
    name: "Tiket konser",
    icon: "music",
    target: 500000,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
    reachedAt: null,
    ...over,
  };
}

let depositCounter = 0;

/** A made-up deposit for tests. */
export function makeDeposit(over: Partial<Deposit> & Pick<Deposit, "goalId" | "amount" | "occurredOn">): Deposit {
  depositCounter += 1;
  return {
    id: `dep-${depositCounter}`,
    source: "manual",
    pauseId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}
