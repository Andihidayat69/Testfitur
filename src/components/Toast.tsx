import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, layout, shadow } from "@/theme";

import { AppText } from "./AppText";

const TOAST_MS = 3000;

const ToastContext = createContext<((message: string) => void) | null>(null);

/** Short confirmation at the top of the screen, gone after 3 seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), TOAST_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 8 }]}>
          <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <AppText color={colors.white} align="center">
              {message}
            </AppText>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider");
  return show;
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: layout.sideMargin, right: layout.sideMargin, alignItems: "center" },
  toast: {
    backgroundColor: colors.text,
    borderRadius: layout.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 480,
    ...shadow,
  },
});
