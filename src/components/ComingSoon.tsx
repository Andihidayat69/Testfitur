import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";
import { Mascot } from "./Mascot";

/** Placeholder for a tab whose feature is not built yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.body}>
        <Mascot pose="fokus" height={160} />
        <AppText variant="title" align="center">
          Segera hadir.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg2 },
  title: { paddingHorizontal: layout.sideMargin, paddingTop: 16 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
});
