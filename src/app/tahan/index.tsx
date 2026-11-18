import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Chip, MoneyInput, Pad, Screen, StepHeader } from "@/components";
import { expenseCategories } from "@/features/expenses/categories";
import { ITEM_MAX_LENGTH, pauseCategories, validatePauseItem, validatePausePrice } from "@/features/pause/pause";
import { usePauseDraft } from "@/features/pause/pause-draft-context";
import { colors, fontFamily, layout, maxFontSizeMultiplier } from "@/theme";

/** Step 1: what and how much. */
export default function PauseWhat() {
  const draft = usePauseDraft();
  const [itemError, setItemError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const next = () => {
    const item = validatePauseItem(draft.item);
    const price = validatePausePrice(draft.priceDigits);
    setItemError(item.ok ? null : item.error);
    setPriceError(price.ok ? null : price.error);
    if (!item.ok || !price.ok) return;
    draft.setItem(item.value);
    draft.setPrice(price.value);
    router.push("/tahan/dampak");
  };

  return (
    <Screen
      header={<StepHeader label="Langkah 1 dari 4" step={0} total={4} onBack={() => router.back()} />}
      actions={<Button label="Cek sisa jajan" onPress={next} />}
    >
      <Pad gap={20}>
        <View style={{ gap: 4, marginTop: 12 }}>
          <AppText variant="title">Mau beli apa?</AppText>
          <AppText>Tulis barang dan harganya. Kita lihat dulu dampaknya.</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="label">Nama barang</AppText>
          <TextInput
            testID="pause-item-input"
            accessibilityLabel="Nama barang"
            value={draft.item}
            onChangeText={(v) => {
              draft.setItem(v);
              setItemError(null);
            }}
            placeholder="Sepatu sneakers"
            placeholderTextColor={colors.secondary}
            maxLength={ITEM_MAX_LENGTH}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            autoFocus
            style={[styles.textInput, itemError && { borderColor: colors.dangerSoft }]}
          />
          {itemError ? (
            <AppText variant="caption" color={colors.dangerSoft}>
              {itemError}
            </AppText>
          ) : null}
        </View>

        <MoneyInput
          testID="pause-price-input"
          label="Harga"
          value={draft.priceDigits}
          onChangeText={(v) => {
            draft.setPriceDigits(v);
            setPriceError(null);
          }}
          placeholder="400.000"
          error={priceError}
        />

        <View style={styles.field}>
          <AppText variant="label">Kategori</AppText>
          <View style={styles.chips}>
            {pauseCategories.map((c) => (
              <Chip
                key={c}
                label={expenseCategories[c].name}
                selected={draft.category === c}
                onPress={() => draft.setCategory(c)}
              />
            ))}
          </View>
        </View>
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
