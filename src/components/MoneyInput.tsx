import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { formatRupiahInput } from "@/lib/money";
import { colors, fontFamily, layout, maxFontSizeMultiplier } from "@/theme";

import { AppText } from "./AppText";

type Props = {
  label: string;
  value: string; // digits as typed, formatted for display here
  onChangeText: (digits: string) => void;
  placeholder?: string;
  error?: string | null;
  testID?: string;
  autoFocus?: boolean;
};

export function MoneyInput({ label, value, onChangeText, placeholder, error, testID, autoFocus }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.dangerSoft : focused ? colors.primary : colors.accent;
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.box, { borderColor }]}>
        <AppText variant="title" style={styles.prefix}>
          Rp
        </AppText>
        <TextInput
          testID={testID}
          autoFocus={autoFocus}
          accessibilityLabel={label}
          value={formatRupiahInput(value)}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, ""))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.secondary}
          keyboardType="number-pad"
          inputMode="numeric"
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={styles.input}
        />
      </View>
      {error ? (
        <AppText variant="caption" color={colors.dangerSoft} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  box: {
    height: layout.controlHeight,
    borderWidth: 1.5,
    borderRadius: layout.radius,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  prefix: { fontFamily: fontFamily.bold },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
});
