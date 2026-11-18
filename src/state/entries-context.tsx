import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { EntryStore } from "@/db/entry-store";
import type { Entry, EntryInput } from "@/features/expenses/entry";

type EntriesContextValue = {
  /** Every entry, in no particular order. Personal-scale data, so it is kept in memory. */
  entries: Entry[];
  addEntry: (input: EntryInput) => Promise<Entry>;
  updateEntry: (id: string, input: EntryInput) => Promise<Entry>;
  removeEntry: (id: string) => Promise<void>;
  /** Adds an entry another store already saved (for example a "buy" in Pause Before Buying). */
  addSavedEntry: (entry: Entry) => void;
};

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({
  store,
  initialEntries,
  children,
}: {
  store: EntryStore;
  initialEntries: Entry[];
  children: ReactNode;
}) {
  const [entries, setEntries] = useState(initialEntries);

  const addEntry = useCallback(
    async (input: EntryInput) => {
      const saved = await store.add(input);
      setEntries((prev) => [...prev, saved]);
      return saved;
    },
    [store],
  );
  const updateEntry = useCallback(
    async (id: string, input: EntryInput) => {
      const saved = await store.update(id, input);
      setEntries((prev) => prev.map((e) => (e.id === id ? saved : e)));
      return saved;
    },
    [store],
  );
  const removeEntry = useCallback(
    async (id: string) => {
      await store.remove(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [store],
  );

  const addSavedEntry = useCallback((entry: Entry) => setEntries((prev) => [...prev, entry]), []);

  const value = useMemo(
    () => ({ entries, addEntry, updateEntry, removeEntry, addSavedEntry }),
    [entries, addEntry, updateEntry, removeEntry, addSavedEntry],
  );
  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries(): EntriesContextValue {
  const value = useContext(EntriesContext);
  if (!value) throw new Error("useEntries must be used inside EntriesProvider");
  return value;
}
