import { router, useIsFocused } from "expo-router";
import { Modal, StyleSheet, View } from "react-native";

import { AppText, Button, Mascot } from "@/components";
import { formatRupiah } from "@/lib/money";
import { useProfile } from "@/state/profile-context";
import { colors, layout, shadow } from "@/theme";

import { paydayPopupFor } from "./payday";

/** Home's payday pop-up (docs/specs/payday-reminder.md; design system: Reminder pop-up). */
export function PaydayPopup({ today }: { today: string }) {
  const { profile, markPaydayHandled } = useProfile();
  // A Modal floats above every screen, so show it only while Beranda itself is on top.
  const focused = useIsFocused();
  const payday = paydayPopupFor(today, profile?.payday ?? null, profile?.paydayHandledFor ?? null);
  if (!focused || !payday || !profile?.payday) return null;
  const amount = profile.payday.saveAmount;

  const later = () => {
    markPaydayHandled(payday).catch(() => {});
  };

  const saveNow = async () => {
    await markPaydayHandled(payday).catch(() => {});
    // A normal deposit from salary: it does not reduce jajan left.
    router.push({ pathname: "/setoran/baru", params: { amount: String(amount), mainGoal: "1" } });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={later}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal testID="payday-popup">
          <View style={styles.mascot}>
            <Mascot pose="cek-hp" height={130} />
          </View>
          <AppText variant="title" align="center">
            Yeay, hari gajian!
          </AppText>
          <AppText align="center">Sisihkan {formatRupiah(amount)} dulu sebelum kepakai, yuk.</AppText>
          <View style={styles.actions}>
            <Button label="Sisihkan sekarang" onPress={saveNow} />
            <Button label="Nanti saja" variant="secondary" onPress={later} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 43, 85, 0.4)", // Deep Navy 40%
    alignItems: "center",
    justifyContent: "center",
    padding: layout.sideMargin,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: layout.radius,
    padding: 24,
    paddingTop: 16,
    gap: 8,
    ...shadow,
  },
  mascot: { alignItems: "center" },
  actions: { gap: 12, marginTop: 12 },
});
