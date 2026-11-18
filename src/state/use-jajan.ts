import { useMemo } from "react";

import { jajanForMonth } from "@/features/home/jajan";
import { monthOf } from "@/lib/dates";

import { useEntries } from "./entries-context";
import { useProfile } from "./profile-context";
import { useSavings } from "./savings-context";

/** Jajan budget, spending, money moved to saving and status for the month that contains `today`. */
export function useJajan(today: string) {
  const { profile } = useProfile();
  const { entries } = useEntries();
  const { deposits } = useSavings();
  return useMemo(() => {
    const budget = profile?.jajanBudget ?? 0;
    return { budget, ...jajanForMonth(budget, entries, deposits, monthOf(today)) };
  }, [profile, entries, deposits, today]);
}
