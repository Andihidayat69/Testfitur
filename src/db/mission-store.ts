import type { Mission, MissionInput } from "@/features/missions/missions";

/**
 * Storage for completed daily missions. `complete` is idempotent per day: if a mission already
 * exists for `doneOn`, it is returned unchanged (no second mission, no extra points).
 * The app uses SQLite; tests use the in-memory version.
 */
export interface MissionStore {
  listAll(): Promise<Mission[]>;
  complete(input: MissionInput & { points: number }): Promise<Mission>;
}

export function createInMemoryMissionStore(initial: Mission[] = []): MissionStore {
  let rows = [...initial];
  let seq = 0;
  return {
    async listAll() {
      return [...rows];
    },
    async complete(input) {
      const existing = rows.find((m) => m.doneOn === input.doneOn);
      if (existing) return existing;
      seq += 1;
      const mission: Mission = { ...input, id: `mission-${seq}`, completedAt: new Date() };
      rows = [...rows, mission];
      return mission;
    },
  };
}
