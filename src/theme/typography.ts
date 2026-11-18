import type { TextStyle } from "react-native";

// Font names registered in the root layout (see src/theme/fonts.ts).
export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

// Text styles from docs/design/design-system.md. Nothing smaller than 14.
export const textStyles = {
  display: { fontFamily: fontFamily.extraBold, fontSize: 36, lineHeight: 44, fontVariant: ["tabular-nums"] },
  heading: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 32 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: fontFamily.bold, fontSize: 19, lineHeight: 24 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textStyles;

// Caps the phone's font size setting so layouts do not break.
export const maxFontSizeMultiplier = 1.3;

// Display numbers step down for long values so they stay on one line.
export function displaySizeFor(text: string): number {
  if (text.length > 14) return 28;
  if (text.length > 11) return 32;
  return 36;
}
