import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";

import type { Mission } from "@/features/missions/missions";
import type { MissionLevel } from "@/features/missions/questions";

import type { MissionStore } from "./mission-store";
import * as schema from "./schema";

type Row = typeof schema.missions.$inferSelect;

function toMission(row: Row): Mission {
  return {
    id: row.id,
    doneOn: row.doneOn,
    level: row.level as MissionLevel,
    questionIds: row.questionIds.split(",").filter((id) => id !== ""),
    correct: row.correct,
    points: row.points,
    completedAt: row.completedAt,
  };
}

export function createSqliteMissionStore(db: ExpoSQLiteDatabase<typeof schema>): MissionStore {
  const findByDay = (doneOn: string) =>
    db.select().from(schema.missions).where(eq(schema.missions.doneOn, doneOn)).get();

  return {
    async listAll() {
      const rows = await db.select().from(schema.missions).all();
      return rows.map(toMission);
    },
    async complete(input) {
      const existing = await findByDay(input.doneOn);
      if (existing) return toMission(existing);
      await db
        .insert(schema.missions)
        .values({
          id: Crypto.randomUUID(),
          doneOn: input.doneOn,
          level: input.level,
          questionIds: input.questionIds.join(","),
          correct: input.correct,
          points: input.points,
          completedAt: new Date(),
        })
        .onConflictDoNothing(); // the unique day makes a double tap harmless
      const saved = await findByDay(input.doneOn);
      if (!saved) throw new Error("mission not saved");
      return toMission(saved);
    },
  };
}
