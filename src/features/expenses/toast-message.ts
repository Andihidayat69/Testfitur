import { formatRupiah } from "@/lib/money";

import { isJajanCategory } from "./categories";
import type { EntryInput } from "./entry";

/** Confirmation after saving (docs/specs/expense-tracker.md, Add Entry). */
export function savedMessage(input: EntryInput, jajanLeftAfter: number): string {
  if (input.type === "expense" && input.category && isJajanCategory(input.category)) {
    return jajanLeftAfter < 0
      ? "Tercatat. Kuota jajanmu sudah lewat, tenang aja."
      : `Tercatat. Sisa jajanmu ${formatRupiah(jajanLeftAfter)}.`;
  }
  return "Tercatat.";
}
