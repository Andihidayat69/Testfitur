import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { CompleteOnboardingInput, Profile, ProfileStore } from "@/db/profile-store";
import type { PaydayReminder } from "@/features/payday/payday";

type ProfileContextValue = {
  profile: Profile | null;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<Profile>;
  updateJajanBudget: (jajanBudget: number) => Promise<Profile>;
  updatePayday: (payday: PaydayReminder | null) => Promise<Profile>;
  markPaydayHandled: (payday: string) => Promise<Profile>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  store,
  initialProfile,
  children,
}: {
  store: ProfileStore;
  initialProfile: Profile | null;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const completeOnboarding = useCallback(
    async (input: CompleteOnboardingInput) => {
      const saved = await store.completeOnboarding(input);
      setProfile(saved);
      return saved;
    },
    [store],
  );
  const updateJajanBudget = useCallback(
    async (jajanBudget: number) => {
      const saved = await store.updateJajanBudget(jajanBudget);
      setProfile(saved);
      return saved;
    },
    [store],
  );
  const updatePayday = useCallback(
    async (payday: PaydayReminder | null) => {
      const saved = await store.updatePayday(payday);
      setProfile(saved);
      return saved;
    },
    [store],
  );
  const markPaydayHandled = useCallback(
    async (payday: string) => {
      const saved = await store.markPaydayHandled(payday);
      setProfile(saved);
      return saved;
    },
    [store],
  );
  const value = useMemo(
    () => ({ profile, completeOnboarding, updateJajanBudget, updatePayday, markPaydayHandled }),
    [profile, completeOnboarding, updateJajanBudget, updatePayday, markPaydayHandled],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile must be used inside ProfileProvider");
  return value;
}
