import { router } from "expo-router";

import { useToast } from "@/components";
import { BudgetForm } from "@/features/habit-check/BudgetForm";
import { useProfile } from "@/state/profile-context";

/** Change the jajan budget from Profil (docs/specs/home.md). */
export default function EditBudget() {
  const { profile, updateJajanBudget } = useProfile();
  const toast = useToast();
  return (
    <BudgetForm
      headerLabel="Ubah kuota jajan"
      initialValue={profile?.jajanBudget}
      onBack={() => router.back()}
      onSave={async (jajanBudget) => {
        await updateJajanBudget(jajanBudget);
        toast("Kuota jajan diperbarui.");
        router.back();
      }}
    />
  );
}
