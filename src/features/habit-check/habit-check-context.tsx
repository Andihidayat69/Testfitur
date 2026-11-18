import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { HabitType } from "./habit-types";

/**
 * In-memory quiz state for one onboarding run. Not persisted: if the app is
 * closed before the jajan budget is saved, onboarding starts again at welcome.
 */
type HabitCheckState = {
  answers: (number | undefined)[];
  setAnswer: (questionIndex: number, answerIndex: number) => void;
  habitType: HabitType | null;
  setHabitType: (habitType: HabitType) => void;
};

const HabitCheckContext = createContext<HabitCheckState | null>(null);

export function HabitCheckProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [habitType, setHabitType] = useState<HabitType | null>(null);
  const value = useMemo<HabitCheckState>(
    () => ({
      answers,
      setAnswer: (q, a) =>
        setAnswers((prev) => {
          const next = [...prev];
          next[q] = a;
          return next;
        }),
      habitType,
      setHabitType,
    }),
    [answers, habitType],
  );
  return <HabitCheckContext.Provider value={value}>{children}</HabitCheckContext.Provider>;
}

export function useHabitCheck(): HabitCheckState {
  const value = useContext(HabitCheckContext);
  if (!value) throw new Error("useHabitCheck must be used inside HabitCheckProvider");
  return value;
}
