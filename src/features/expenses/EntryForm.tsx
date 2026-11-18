import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Chip, ConfirmDialog, DateField, MoneyInput, Pad, Screen, StepHeader } from "@/components";
import { colors, fontFamily, layout, maxFontSizeMultiplier } from "@/theme";

import { validateEntryAmount } from "./amount";
import { expenseCategories, expenseCategoryCodes, type ExpenseCategory } from "./categories";
import { NOTE_MAX_LENGTH, normalizeNote, type Entry, type EntryInput, type EntryType } from "./entry";

type Props = {
  title: string;
  today: string;
  initial?: Entry;
  onBack: () => void;
  onSave: (input: EntryInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

/** Add or edit an expense or income (docs/specs/expense-tracker.md). */
export function EntryForm({ title, today, initial, onBack, onSave, onDelete }: Props) {
  const [type, setType] = useState<EntryType>(initial?.type ?? "expense");
  const [digits, setDigits] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? "food_snacks");
  const [note, setNote] = useState(initial?.note ?? "");
  const [occurredOn, setOccurredOn] = useState(initial?.occurredOn ?? today);
  const [error, setError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    const amount = validateEntryAmount(digits);
    if (!amount.ok) {
      setError(amount.error);
      return;
    }
    setBusy(true);
    setSaveFailed(false);
    try {
      await onSave({
        type,
        amount: amount.value,
        category: type === "expense" ? category : null,
        note: normalizeNote(note),
        occurredOn: occurredOn > today ? today : occurredOn,
      });
    } catch {
      setSaveFailed(true);
      setBusy(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
    } catch {
      setSaveFailed(true);
      setBusy(false);
    }
  };

  return (
    <Screen
      header={<StepHeader label={title} onBack={onBack} />}
      actions={
        <>
          <Button label="Simpan" onPress={save} disabled={busy} />
          {onDelete ? (
            <Button label="Hapus catatan" variant="secondary" onPress={() => setConfirmDelete(true)} disabled={busy} />
          ) : null}
        </>
      }
    >
      <Pad gap={20}>
        <View style={styles.segment} accessibilityRole="tablist">
          {(["expense", "income"] as const).map((t) => (
            <Chip
              key={t}
              label={t === "expense" ? "Pengeluaran" : "Pemasukan"}
              selected={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </View>

        <MoneyInput
          testID="entry-amount-input"
          label="Nominal"
          value={digits}
          onChangeText={(next) => {
            setDigits(next);
            setError(null);
          }}
          placeholder={type === "expense" ? "25.000" : "3.000.000"}
          error={error}
          autoFocus={!initial}
        />

        {type === "expense" ? (
          <View style={styles.field}>
            <AppText variant="label">Kategori</AppText>
            <View style={styles.chips}>
              {expenseCategoryCodes.map((code) => (
                <Chip
                  key={code}
                  label={expenseCategories[code].name}
                  selected={category === code}
                  onPress={() => setCategory(code)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.field}>
          <AppText variant="label">Untuk apa?</AppText>
          <TextInput
            testID="entry-note-input"
            accessibilityLabel="Untuk apa?"
            value={note}
            onChangeText={setNote}
            placeholder={type === "expense" ? "Kopi susu" : "Gaji"}
            placeholderTextColor={colors.secondary}
            maxLength={NOTE_MAX_LENGTH}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={styles.textInput}
          />
        </View>

        <DateField value={occurredOn} today={today} onChange={setOccurredOn} />

        {saveFailed ? (
          <AppText color={colors.dangerSoft} accessibilityLiveRegion="polite">
            Maaf, belum berhasil disimpan. Coba lagi, ya.
          </AppText>
        ) : null}
      </Pad>

      <ConfirmDialog
        visible={confirmDelete}
        title="Hapus catatan ini?"
        confirmLabel="Hapus"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: "row", gap: 8, marginTop: 12 },
  field: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  textInput: {
    height: layout.controlHeight,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: layout.radius,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text,
  },
});
