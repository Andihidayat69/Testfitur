import { parseRupiahInput } from "@/lib/money";

export const ENTRY_AMOUNT_MAX = 100_000_000;

export type AmountValidation = { ok: true; value: number } | { ok: false; error: string };

export function validateEntryAmount(input: string): AmountValidation {
  const value = parseRupiahInput(input);
  if (value === null || value === 0) return { ok: false, error: "Isi nominalnya dulu, ya." };
  if (value > ENTRY_AMOUNT_MAX) return { ok: false, error: "Maksimal Rp100.000.000, ya." };
  return { ok: true, value };
}
