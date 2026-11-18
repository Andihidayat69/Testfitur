import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout } from "@/theme";

type Props = {
  children: ReactNode;
  header?: ReactNode;
  actions?: ReactNode; // primary button area, pinned to the bottom
  edges?: ("top" | "bottom")[];
};

export function Screen({ children, header, actions, edges = ["top", "bottom"] }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {header}
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Horizontal page padding for content below a hero. */
export function Pad({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  return <View style={{ paddingHorizontal: layout.sideMargin, gap }}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg2 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 24 },
  actions: { paddingHorizontal: layout.sideMargin, paddingTop: 12, paddingBottom: 16, gap: 12 },
});
