// Money is an integer number of rupiah everywhere in the app: no decimals, no floats.

/** 400000 → "Rp400.000"; -25000 → "−Rp25.000". */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "−" : "";
  return `${sign}Rp${groupThousands(Math.abs(rounded))}`;
}

/** 1250000 → "1.250.000". */
export function groupThousands(value: number): string {
  return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Keeps digits only: "Rp 1.250.000" → 1250000; "" → null. Leading zeros drop out. */
export function parseRupiahInput(text: string): number | null {
  const digits = text.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (digits === "") return null;
  return Number(digits);
}

/** What a money input shows while typing: "1250000" → "1.250.000". */
export function formatRupiahInput(text: string): string {
  const value = parseRupiahInput(text);
  return value === null ? "" : groupThousands(value);
}
