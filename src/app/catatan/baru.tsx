import { router } from "expo-router";

import { useToast } from "@/components";
import { EntryForm } from "@/features/expenses/EntryForm";
import { savedMessage } from "@/features/expenses/toast-message";
import { jajanForMonth } from "@/features/home/jajan";
import { monthOf } from "@/lib/dates";
import { useEntries } from "@/state/entries-context";
import { useProfile } from "@/state/profile-context";
import { useSavings } from "@/state/savings-context";
import { useToday } from "@/state/use-today";

export default function NewEntry() {
  const today = useToday();
  const { entries, addEntry } = useEntries();
  const { profile } = useProfile();
  const { deposits } = useSavings();
  const toast = useToast();

  return (
    <EntryForm
      title="Catat"
      today={today}
      onBack={() => router.back()}
      onSave={async (input) => {
        const saved = await addEntry(input);
        const budget = profile?.jajanBudget ?? 0;
        const { status } = jajanForMonth(budget, [...entries, saved], deposits, monthOf(today));
        toast(savedMessage(input, status.left));
        router.back();
      }}
    />
  );
}
