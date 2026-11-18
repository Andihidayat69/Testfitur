import { useMissions } from "./missions-context";
import { usePauses } from "./pauses-context";

/** The user's points: from waiting in Pause Before Buying plus from Daily Habit Missions. */
export function useTotalPoints(): number {
  return usePauses().points + useMissions().points;
}
