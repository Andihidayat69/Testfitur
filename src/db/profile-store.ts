import type { HabitType } from "@/features/habit-check/habit-types";
import type { PaydayReminder } from "@/features/payday/payday";

export type Profile = {
  habitType: HabitType;
  jajanBudget: number; // integer rupiah
  onboardingCompletedAt: Date;
  payday: PaydayReminder | null;
  paydayHandledFor: string | null; // local YYYY-MM-DD
};

export type CompleteOnboardingInput = Pick<Profile, "habitType" | "jajanBudget">;

/** Storage for the local profile. The app uses the SQLite store; tests use the in-memory one. */
export interface ProfileStore {
  getProfile(): Promise<Profile | null>;
  completeOnboarding(input: CompleteOnboardingInput): Promise<Profile>;
  updateJajanBudget(jajanBudget: number): Promise<Profile>;
  /** Sets or clears (null) the payday reminder. */
  updatePayday(payday: PaydayReminder | null): Promise<Profile>;
  markPaydayHandled(payday: string): Promise<Profile>;
}

export function createInMemoryProfileStore(initial: Profile | null = null): ProfileStore {
  let current = initial;
  return {
    async getProfile() {
      return current;
    },
    async completeOnboarding(input) {
      current = { ...input, onboardingCompletedAt: new Date(), payday: null, paydayHandledFor: null };
      return current;
    },
    async updateJajanBudget(jajanBudget) {
      if (!current) throw new Error("No profile");
      current = { ...current, jajanBudget };
      return current;
    },
    async updatePayday(payday) {
      if (!current) throw new Error("No profile");
      current = { ...current, payday };
      return current;
    },
    async markPaydayHandled(payday) {
      if (!current) throw new Error("No profile");
      current = { ...current, paydayHandledFor: payday };
      return current;
    },
  };
}
