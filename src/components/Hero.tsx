import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, layout } from "@/theme";

type Props = {
  tone?: "primary" | "soft";
  children: ReactNode;
  align?: "center" | "start";
  /** Extra top padding when the hero runs up behind the status bar. */
  topInset?: number;
};

/** Top block of a main screen: holds the mascot and one big number. */
export function Hero({ tone = "soft", children, align = "center", topInset = 0 }: Props) {
  const primary = tone === "primary";
  return (
    <View
      style={[
        styles.hero,
        { backgroundColor: primary ? colors.primary : colors.bg1, paddingTop: 24 + topInset },
        align === "center" && styles.center,
      ]}
    >
      <View style={[styles.blob, styles.blobLarge, { backgroundColor: primary ? colors.secondary : colors.accent }]} />
      <View style={[styles.blob, styles.blobSmall, { backgroundColor: primary ? colors.secondary : colors.accent }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: "hidden",
    borderBottomLeftRadius: layout.heroRadius,
    borderBottomRightRadius: layout.heroRadius,
    paddingHorizontal: layout.sideMargin,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 8,
  },
  center: { alignItems: "center" },
  blob: { position: "absolute", borderRadius: 999, opacity: 0.45 },
  blobLarge: { width: 180, height: 180, right: -50, top: -60 },
  blobSmall: { width: 110, height: 110, left: -40, bottom: -30 },
});
