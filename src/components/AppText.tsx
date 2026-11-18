import { Text, type TextProps } from "react-native";

import { colors, maxFontSizeMultiplier, textStyles, type TextVariant } from "@/theme";

type Props = TextProps & { variant?: TextVariant; color?: string; align?: "left" | "center" };

export function AppText({ variant = "body", color = colors.text, align, style, ...rest }: Props) {
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[textStyles[variant], { color }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
