import { Redirect, router, useLocalSearchParams } from "expo-router";

import { useToast } from "@/components";
import { EntryForm } from "@/features/expenses/EntryForm";
import { savedMessage } from "@/features/expenses/toast-message";
import { jajanForMonth } from "@/features/home/jajan";
import { monthOf } from "@/lib/dates";
import { useEntries } from "@/state/entries-context";
import { useProfile } from "@/state/profile-context";
import { useSavings } from "@/state/savings-context";
import { useToday } from "@/state/use-today";

export default function EditEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { entries, updateEntry, removeEntry } = useEntries();
  const { profile } = useProfile();
  const { deposits } = useSavings();
  const toast = useToast();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return <Redirect href="/catat" />;

  return (
    <EntryForm
      title="Ubah catatan"
      today={today}
      initial={entry}
      onBack={() => router.back()}
      onSave={async (input) => {
        const saved = await updateEntry(entry.id, input);
        const after = entries.map((e) => (e.id === entry.id ? saved : e));
        const budget = profile?.jajanBudget ?? 0;
        const { status } = jajanForMonth(budget, after, deposits, monthOf(today));
        toast(savedMessage(input, status.left));
        router.back();
      }}
      onDelete={async () => {
        router.back();
        await removeEntry(entry.id);
        toast("Catatan dihapus.");
      }}
    />
  );
}
