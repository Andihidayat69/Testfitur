import type { ExpenseCategory } from "./categories";
import { expenseCategories } from "./categories";

export type EntryType = "expense" | "income";

/** One recorded expense or income. `occurredOn` is a local calendar date, YYYY-MM-DD. */
export type Entry = {
  id: string;
  type: EntryType;
  amount: number; // integer rupiah, > 0
  category: ExpenseCategory | null; // null for income
  note: string | null;
  occurredOn: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EntryInput = Pick<Entry, "type" | "amount" | "category" | "note" | "occurredOn">;

export const NOTE_MAX_LENGTH = 40;

/** Trims; empty or spaces-only becomes null. */
export function normalizeNote(note: string): string | null {
  const trimmed = note.trim().slice(0, NOTE_MAX_LENGTH);
  return trimmed === "" ? null : trimmed;
}

/** What a list shows for an entry: its note, or the category name ("Pemasukan" for income). */
export function entryTitle(entry: Pick<Entry, "type" | "category" | "note">): string {
  if (entry.note) return entry.note;
  if (entry.type === "income" || !entry.category) return "Pemasukan";
  return expenseCategories[entry.category].name;
}
