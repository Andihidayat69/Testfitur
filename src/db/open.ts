import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseAsync } from "expo-sqlite";

import { getOrCreateDatabaseKey } from "./encryption-key";
import type { EntryStore } from "./entry-store";
import migrations from "./migrations/migrations";
import type { MissionStore } from "./mission-store";
import type { PauseStore } from "./pause-store";
import type { ProfileStore } from "./profile-store";
import type { SavingStore } from "./saving-store";
import * as schema from "./schema";
import { createSqliteEntryStore } from "./sqlite-entry-store";
import { createSqliteMissionStore } from "./sqlite-mission-store";
import { createSqlitePauseStore } from "./sqlite-pause-store";
import { createSqliteProfileStore } from "./sqlite-profile-store";
import { createSqliteSavingStore } from "./sqlite-saving-store";

const DATABASE_NAME = "jajantenang.db";

export type AppStores = {
  profile: ProfileStore;
  entries: EntryStore;
  pauses: PauseStore;
  saving: SavingStore;
  missions: MissionStore;
};

/** Opens the encrypted database, runs pending migrations, and returns the stores. */
export async function openAppStores(): Promise<AppStores> {
  const key = await getOrCreateDatabaseKey();
  const sqlite = await openDatabaseAsync(DATABASE_NAME);
  // The key must be set before any other statement (SQLCipher). Hex only, so no quoting issues.
  await sqlite.execAsync(`PRAGMA key = '${key}';`);
  await sqlite.execAsync("PRAGMA foreign_keys = ON;");
  const db = drizzle(sqlite, { schema });
  try {
    await migrate(db, migrations);
  } catch (error) {
    if (__DEV__) {
      console.error("MIGRATION ERROR DETAIL:", error);
      console.error("SQLITE ROOT CAUSE:", (error as any)?.cause);
    }
    throw error;
  }
  return {
    profile: createSqliteProfileStore(db),
    entries: createSqliteEntryStore(db),
    pauses: createSqlitePauseStore(db),
    saving: createSqliteSavingStore(db),
    missions: createSqliteMissionStore(db),
  };
}
