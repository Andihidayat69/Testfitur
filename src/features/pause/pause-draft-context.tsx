import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { RecordedDecision } from "@/db/pause-store";

import { DEFAULT_PAUSE_CATEGORY, pickQuestion, type PauseCategory } from "./pause";

/**
 * One pause in progress (steps 1–4). In memory only: leaving before the decision saves nothing.
 */
type PauseDraft = {
  item: string;
  setItem: (v: string) => void;
  priceDigits: string;
  setPriceDigits: (v: string) => void;
  price: number; // validated on step 1
  setPrice: (v: number) => void;
  category: PauseCategory;
  setCategory: (v: PauseCategory) => void;
  question: number; // picked once when the pause starts
  result: RecordedDecision | null;
  setResult: (r: RecordedDecision) => void;
};

const PauseDraftContext = createContext<PauseDraft | null>(null);

export function PauseDraftProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState("");
  const [priceDigits, setPriceDigits] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<PauseCategory>(DEFAULT_PAUSE_CATEGORY);
  const [question] = useState(() => pickQuestion());
  const [result, setResult] = useState<RecordedDecision | null>(null);
  const value = useMemo(
    () => ({ item, setItem, priceDigits, setPriceDigits, price, setPrice, category, setCategory, question, result, setResult }),
    [item, priceDigits, price, category, question, result],
  );
  return <PauseDraftContext.Provider value={value}>{children}</PauseDraftContext.Provider>;
}

export function usePauseDraft(): PauseDraft {
  const value = useContext(PauseDraftContext);
  if (!value) throw new Error("usePauseDraft must be used inside PauseDraftProvider");
  return value;
}
