import type { HabitType } from "@/features/habit-check/habit-types";
import type { PaydayReminder } from "@/features/payday/payday";

export type Profile = {
  name: string;
  habitType: HabitType;
  jajanBudget: number;
  onboardingCompletedAt: Date;
  payday: PaydayReminder | null;
  paydayHandledFor: string | null;
};

export type CompleteOnboardingInput = Pick<
  Profile,
  "habitType" | "jajanBudget"
> & {
  name?: string;
};

export interface ProfileStore {
  getProfile(): Promise<Profile | null>;
  completeOnboarding(input: CompleteOnboardingInput): Promise<Profile>;
  updateJajanBudget(jajanBudget: number): Promise<Profile>;
  updatePayday(payday: PaydayReminder | null): Promise<Profile>;
  markPaydayHandled(payday: string): Promise<Profile>;
}

export function createInMemoryProfileStore(
  initial: Profile | null = null,
): ProfileStore {
  let current = initial;

  return {
    async getProfile() {
      return current;
    },

    async completeOnboarding(input) {
      current = {
        name: input.name?.trim() || "Teman",
        habitType: input.habitType,
        jajanBudget: input.jajanBudget,
        onboardingCompletedAt: new Date(),
        payday: null,
        paydayHandledFor: null,
      };

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