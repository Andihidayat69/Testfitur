import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText, Button, Chip, MoneyInput, Pad, Screen, StepHeader, TextAction } from "@/components";
import { colors, layout } from "@/theme";

import { notificationPermission, openNotificationSettings } from "./notifications";
import { PAYDAY_QUICK_PICKS, isValidPaydayDay, validatePaydayAmount, type PaydayReminder } from "./payday";

type Props = {
  initial: PaydayReminder | null;
  skipLabel?: string; // onboarding: "Nanti saja"
  onBack: () => void;
  onSave: (reminder: PaydayReminder) => Promise<void>;
  onSkip?: () => void;
  onTurnOff?: () => Promise<void>;
};

/** Set up or change the payday reminder (docs/specs/payday-reminder.md). */
export function PaydayForm({ initial, skipLabel, onBack, onSave, onSkip, onTurnOff }: Props) {
  const [day, setDay] = useState<number | null>(initial?.day ?? null);
  const [digits, setDigits] = useState(initial ? String(initial.saveAmount) : "");
  const [dayError, setDayError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    notificationPermission()
      .then((p) => setDenied(p === "blocked"))
      .catch(() => {});
  }, []);

  const custom = day !== null && !PAYDAY_QUICK_PICKS.includes(day);

  const save = async () => {
    const amount = validatePaydayAmount(digits);
    setDayError(isValidPaydayDay(day) ? null : "Pilih tanggal gajianmu dulu, ya.");
    setAmountError(amount.ok ? null : amount.error);
    if (!isValidPaydayDay(day) || !amount.ok) return;
    setBusy(true);
    setFailed(false);
    try {
      await onSave({ day, saveAmount: amount.value });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <Screen
      header={
        <StepHeader
          label="Pengingat gajian"
          onBack={onBack}
          right={onSkip && skipLabel ? <TextAction label={skipLabel} onPress={onSkip} /> : undefined}
        />
      }
      actions={
        <>
          <Button label="Ingatkan aku" onPress={save} disabled={busy} />
          {onTurnOff ? (
            <Button
              label="Matikan pengingat"
              variant="secondary"
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await onTurnOff();
                } catch {
                  setFailed(true);
                  setBusy(false);
                }
              }}
            />
          ) : null}
        </>
      }
    >
      <Pad gap={20}>
        <View style={{ gap: 4, marginTop: 12 }}>
          <AppText variant="title">Kapan kamu gajian?</AppText>
          <AppText>Di hari itu, kami ingatkan kamu menyisihkan uang dulu.</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="label">Tanggal gajian</AppText>
          <View style={styles.chips}>
            {PAYDAY_QUICK_PICKS.map((d) => (
              <Chip
                key={d}
                label={`Tgl ${d}`}
                selected={day === d}
                onPress={() => {
                  setDay(d);
                  setDayError(null);
                }}
              />
            ))}
            <Chip label={custom ? `Tgl ${day}` : "Tanggal lain"} selected={custom} onPress={() => setPickerOpen(true)} />
          </View>
          {dayError ? (
            <AppText variant="caption" color={colors.dangerSoft}>
              {dayError}
            </AppText>
          ) : null}
        </View>

        <MoneyInput
          testID="payday-amount-input"
          label="Sisihkan tiap gajian"
          value={digits}
          onChangeText={(v) => {
            setDigits(v);
            setAmountError(null);
          }}
          placeholder="300.000"
          error={amountError}
        />

        {denied ? (
          <View style={styles.note} testID="notifications-denied">
            <AppText>Notifikasi mati. Kamu tetap dapat pengingat saat buka aplikasi.</AppText>
            <TextAction label="Buka pengaturan" onPress={openNotificationSettings} />
          </View>
        ) : null}

        {failed ? (
          <AppText color={colors.dangerSoft} accessibilityLiveRegion="polite">
            Maaf, belum berhasil disimpan. Coba lagi, ya.
          </AppText>
        ) : null}
      </Pad>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <AppText variant="title" align="center">
              Pilih tanggal gajian
            </AppText>
            <View style={styles.grid}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <Pressable
                  key={d}
                  accessibilityRole="button"
                  accessibilityLabel={`Tanggal ${d}`}
                  onPress={() => {
                    setDay(d);
                    setDayError(null);
                    setPickerOpen(false);
                  }}
                  style={[styles.dayCell, day === d && styles.dayCellOn]}
                >
                  <AppText variant="label">{d}</AppText>
                </Pressable>
              ))}
            </View>
            <AppText variant="caption" align="center">
              Bulan yang lebih pendek pakai tanggal terakhirnya.
            </AppText>
            <Button label="Batal" variant="secondary" onPress={() => setPickerOpen(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  note: { backgroundColor: colors.bg1, borderRadius: layout.radius, padding: 12, gap: 4 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 43, 85, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: layout.sideMargin,
  },
  sheet: { width: "100%", maxWidth: 400, backgroundColor: colors.card, borderRadius: layout.radius, padding: 20, gap: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  dayCellOn: { backgroundColor: colors.accent, borderColor: colors.primary },
});
