import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { PauseStore, RecordedDecision } from "@/db/pause-store";
import { pointsForDecision, totalPoints, type Pause, type PauseDecisionInput } from "@/features/pause/pause";

import { useEntries } from "./entries-context";

type PausesContextValue = {
  pauses: Pause[];
  points: number;
  /** Saves the decision (and the expense for "buy") and works out the points it earns. */
  recordDecision: (input: PauseDecisionInput) => Promise<RecordedDecision>;
};

const PausesContext = createContext<PausesContextValue | null>(null);

export function PausesProvider({
  store,
  initialPauses,
  children,
}: {
  store: PauseStore;
  initialPauses: Pause[];
  children: ReactNode;
}) {
  const [stored, setStored] = useState(initialPauses);
  const { entries, addSavedEntry } = useEntries();

  // Mirror the database's "on delete set null": a deleted expense no longer links to its pause.
  const pauses = useMemo(() => {
    const ids = new Set(entries.map((e) => e.id));
    return stored.map((p) => (p.entryId && !ids.has(p.entryId) ? { ...p, entryId: null } : p));
  }, [stored, entries]);

  const recordDecision = useCallback(
    async (input: PauseDecisionInput) => {
      const points = pointsForDecision(input.decision, input.decidedOn, stored);
      const result = await store.record({ ...input, points });
      setStored((prev) => [...prev, result.pause]);
      if (result.entry) addSavedEntry(result.entry);
      return result;
    },
    [store, stored, addSavedEntry],
  );

  const value = useMemo(
    () => ({ pauses, points: totalPoints(pauses), recordDecision }),
    [pauses, recordDecision],
  );
  return <PausesContext.Provider value={value}>{children}</PausesContext.Provider>;
}

export function usePauses(): PausesContextValue {
  const value = useContext(PausesContext);
  if (!value) throw new Error("usePauses must be used inside PausesProvider");
  return value;
}
