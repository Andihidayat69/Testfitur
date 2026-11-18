
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MissionStore } from "@/db/mission-store";
import {
  MISSION_POINTS,
  totalMissionPoints,
  type Mission,
  type MissionInput,
} from "@/features/missions/missions";

type MissionsContextValue = {
  missions: Mission[];
  points: number;
  completeMission: (input: MissionInput) => Promise<Mission>;
};

const MissionsContext = createContext<MissionsContextValue | null>(null);

export function MissionsProvider({
  store,
  initialMissions,
  children,
}: {
  store: MissionStore;
  initialMissions: Mission[];
  children: ReactNode;
}) {
  const [missions, setMissions] = useState(initialMissions);

  const completeMission = useCallback(
    async (input: MissionInput) => {
      const existing = missions.find((m) => m.doneOn === input.doneOn);
      if (existing) return existing;

      if (
        !Number.isInteger(input.correct) ||
        input.correct < 0 ||
        input.correct > 3
      ) {
        throw new Error("Correct answers must be between 0 and 3");
      }

      const saved = await store.complete({
        ...input,
        points: input.correct * MISSION_POINTS,
      });

      setMissions((prev) =>
        prev.some((m) => m.doneOn === saved.doneOn)
          ? prev
          : [...prev, saved],
      );

      return saved;
    },
    [store, missions],
  );

  const value = useMemo(
    () => ({
      missions,
      points: totalMissionPoints(missions),
      completeMission,
    }),
    [missions, completeMission],
  );

  return (
    <MissionsContext.Provider value={value}>
      {children}
    </MissionsContext.Provider>
  );
}

export function useMissions(): MissionsContextValue {
  const value = useContext(MissionsContext);

  if (!value) {
    throw new Error("useMissions must be used inside MissionsProvider");
  }

  return value;
}
