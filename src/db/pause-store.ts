import type { Entry } from "@/features/expenses/entry";
import type { Pause, PauseDecisionInput } from "@/features/pause/pause";

import type { EntryStore } from "./entry-store";

export type RecordedDecision = { pause: Pause; entry: Entry | null };

/**
 * Storage for pause decisions. `record` saves the pause and, for "buy", the expense in one
 * transaction. The app uses SQLite; tests use the in-memory version.
 */
export interface PauseStore {
  listAll(): Promise<Pause[]>;
  record(input: PauseDecisionInput & { points: number }): Promise<RecordedDecision>;
}

/** In-memory version. Reads `entryId` through the entry store, like the SQLite foreign key (on delete set null). */
export function createInMemoryPauseStore(entryStore: EntryStore, initial: Pause[] = []): PauseStore {
  let rows = [...initial];
  let seq = 0;
  return {
    async listAll() {
      const ids = new Set((await entryStore.listAll()).map((e) => e.id));
      return rows.map((p) => (p.entryId && !ids.has(p.entryId) ? { ...p, entryId: null } : p));
    },
    async record(input) {
      const entry =
        input.decision === "buy"
          ? await entryStore.add({
              type: "expense",
              amount: input.price,
              category: input.category,
              note: input.item,
              occurredOn: input.decidedOn,
            })
          : null;
      seq += 1;
      const pause: Pause = { ...input, id: `pause-${seq}`, decidedAt: new Date(), entryId: entry?.id ?? null };
      rows = [...rows, pause];
      return { pause, entry };
    },
  };
}
