import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

import type { Profile, ProfileStore } from "./profile-store";
import * as schema from "./schema";

const PROFILE_ID = 1;

type Row = typeof schema.profile.$inferSelect;

function toProfile(row: Row): Profile {
  return {
    habitType: row.habitType,
    jajanBudget: row.jajanBudget,
    onboardingCompletedAt: row.onboardingCompletedAt,
    payday:
      row.paydayDay !== null && row.paydaySaveAmount !== null
        ? { day: row.paydayDay, saveAmount: row.paydaySaveAmount }
        : null,
    paydayHandledFor: row.paydayHandledFor,
  };
}

export function createSqliteProfileStore(db: ExpoSQLiteDatabase<typeof schema>): ProfileStore {
  return {
    async getProfile() {
      const row = await db.select().from(schema.profile).where(eq(schema.profile.id, PROFILE_ID)).get();
      return row ? toProfile(row) : null;
    },
    async completeOnboarding({ habitType, jajanBudget }) {
      const values = { id: PROFILE_ID, habitType, jajanBudget, onboardingCompletedAt: new Date() };
      await db.transaction(async (tx) => {
        await tx.insert(schema.profile).values(values).onConflictDoUpdate({ target: schema.profile.id, set: values });
      });
      return { habitType, jajanBudget, onboardingCompletedAt: values.onboardingCompletedAt, payday: null, paydayHandledFor: null };
    },
    async updateJajanBudget(jajanBudget) {
      const rows = await db
        .update(schema.profile)
        .set({ jajanBudget })
        .where(eq(schema.profile.id, PROFILE_ID))
        .returning();
      if (!rows[0]) throw new Error("No profile");
      return toProfile(rows[0]);
    },
    async updatePayday(payday) {
      const rows = await db
        .update(schema.profile)
        .set({ paydayDay: payday?.day ?? null, paydaySaveAmount: payday?.saveAmount ?? null })
        .where(eq(schema.profile.id, PROFILE_ID))
        .returning();
      if (!rows[0]) throw new Error("No profile");
      return toProfile(rows[0]);
    },
    async markPaydayHandled(payday) {
      const rows = await db
        .update(schema.profile)
        .set({ paydayHandledFor: payday })
        .where(eq(schema.profile.id, PROFILE_ID))
        .returning();
      if (!rows[0]) throw new Error("No profile");
      return toProfile(rows[0]);
    },
  };
}
