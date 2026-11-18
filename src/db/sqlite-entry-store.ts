import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";

import type { Entry } from "@/features/expenses/entry";

import type { EntryStore } from "./entry-store";
import * as schema from "./schema";

type Row = typeof schema.entries.$inferSelect;

const toEntry = (row: Row): Entry => ({ ...row });

export function createSqliteEntryStore(db: ExpoSQLiteDatabase<typeof schema>): EntryStore {
  return {
    async listAll() {
      const rows = await db.select().from(schema.entries).all();
      return rows.map(toEntry);
    },
    async add(input) {
      const now = new Date();
      const row = { ...input, id: Crypto.randomUUID(), createdAt: now, updatedAt: now };
      await db.insert(schema.entries).values(row);
      return row;
    },
    async update(id, input) {
      const updatedAt = new Date();
      const rows = await db
        .update(schema.entries)
        .set({ ...input, updatedAt })
        .where(eq(schema.entries.id, id))
        .returning();
      if (!rows[0]) throw new Error("Entry not found");
      return toEntry(rows[0]);
    },
    async remove(id) {
      await db.delete(schema.entries).where(eq(schema.entries.id, id));
    },
  };
}
