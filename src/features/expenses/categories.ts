export const expenseCategoryCodes = [
  "food_snacks",
  "transport",
  "online_shopping",
  "entertainment",
  "bills",
  "other",
] as const;
export type ExpenseCategory = (typeof expenseCategoryCodes)[number];

type CategoryInfo = { name: string; countsAsJajan: boolean; icon: string };

// Fixed list (docs/specs/expense-tracker.md). Order matters: it breaks ties for "largest category".
export const expenseCategories: Record<ExpenseCategory, CategoryInfo> = {
  food_snacks: { name: "Makan & jajan", countsAsJajan: true, icon: "coffee" },
  transport: { name: "Transportasi", countsAsJajan: false, icon: "navigation" },
  online_shopping: { name: "Belanja online", countsAsJajan: true, icon: "shopping-bag" },
  entertainment: { name: "Hiburan", countsAsJajan: true, icon: "film" },
  bills: { name: "Tagihan", countsAsJajan: false, icon: "file-text" },
  other: { name: "Lainnya", countsAsJajan: false, icon: "more-horizontal" },
};

export function isJajanCategory(category: ExpenseCategory): boolean {
  return expenseCategories[category].countsAsJajan;
}
