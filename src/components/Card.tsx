import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, layout, shadow } from "@/theme";

type Props = { children: ReactNode; onPress?: () => void; accessibilityLabel?: string };

/** White card. No cards inside cards (design system). */
export function Card({ children, onPress, accessibilityLabel }: Props) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: layout.radius, padding: 16, gap: 12, ...shadow },
  pressed: { opacity: 0.85 },
});
