import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";

import type { Entry } from "@/features/expenses/entry";
import type { Pause } from "@/features/pause/pause";

import type { PauseStore } from "./pause-store";
import * as schema from "./schema";

export function createSqlitePauseStore(db: ExpoSQLiteDatabase<typeof schema>): PauseStore {
  return {
    async listAll() {
      const rows = await db.select().from(schema.pauses).all();
      return rows.map((row) => ({ ...row }));
    },
    async record(input) {
      const now = new Date();
      let entry: Entry | null = null;
      const pause: Pause = { ...input, id: Crypto.randomUUID(), decidedAt: now, entryId: null };
      await db.transaction(async (tx) => {
        if (input.decision === "buy") {
          entry = {
            id: Crypto.randomUUID(),
            type: "expense",
            amount: input.price,
            category: input.category,
            note: input.item,
            occurredOn: input.decidedOn,
            createdAt: now,
            updatedAt: now,
          };
          await tx.insert(schema.entries).values(entry);
          pause.entryId = entry.id;
        }
        await tx.insert(schema.pauses).values(pause);
      });
      return { pause, entry };
    },
  };
}
