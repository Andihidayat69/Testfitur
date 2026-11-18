import type { Entry, EntryInput } from "@/features/expenses/entry";

/** Storage for expenses and income. The app uses SQLite; tests use the in-memory version. */
export interface EntryStore {
  listAll(): Promise<Entry[]>;
  add(input: EntryInput): Promise<Entry>;
  update(id: string, input: EntryInput): Promise<Entry>;
  remove(id: string): Promise<void>;
}

export function createInMemoryEntryStore(initial: Entry[] = [], newId: () => string = defaultId): EntryStore {
  let rows = [...initial];
  return {
    async listAll() {
      return [...rows];
    },
    async add(input) {
      const now = new Date();
      const entry: Entry = { ...input, id: newId(), createdAt: now, updatedAt: now };
      rows = [...rows, entry];
      return entry;
    },
    async update(id, input) {
      const existing = rows.find((r) => r.id === id);
      if (!existing) throw new Error("Entry not found");
      const entry: Entry = { ...existing, ...input, updatedAt: new Date() };
      rows = rows.map((r) => (r.id === id ? entry : r));
      return entry;
    },
    async remove(id) {
      rows = rows.filter((r) => r.id !== id);
    },
  };
}

let seq = 0;
function defaultId() {
  seq += 1;
  return `mem-${seq}`;
}
