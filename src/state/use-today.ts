import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { toLocalDate } from "@/lib/dates";

/**
 * Today's local date. Refreshes when the screen regains focus or the app returns to the
 * foreground, so month rollover is picked up without restarting the app.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => toLocalDate(new Date()));
  const refresh = useCallback(() => setToday(toLocalDate(new Date())), []);
  useFocusEffect(refresh);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);
  return today;
}
