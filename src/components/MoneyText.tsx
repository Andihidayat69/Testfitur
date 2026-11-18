import { formatRupiah } from "@/lib/money";
import { displaySizeFor } from "@/theme";

import { AppText } from "./AppText";

type Props = { amount: number; color?: string };

/** One big money number: tabular figures, steps down in size for long values. */
export function MoneyText({ amount, color }: Props) {
  const text = formatRupiah(amount);
  const fontSize = displaySizeFor(text);
  return (
    <AppText variant="display" color={color} numberOfLines={1} style={{ fontSize, lineHeight: fontSize + 8 }}>
      {text}
    </AppText>
  );
}
