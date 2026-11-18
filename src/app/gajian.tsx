import { router, useLocalSearchParams } from "expo-router";

import { useToast } from "@/components";
import { PaydayForm } from "@/features/payday/PaydayForm";
import {
  cancelPaydayNotifications,
  ensureNotificationPermission,
  schedulePaydayNotifications,
} from "@/features/payday/notifications";
import { useProfile } from "@/state/profile-context";

/** Payday reminder: optional last step of onboarding, and from Profil. */
export default function PaydayReminderScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === "onboarding";
  const { profile, updatePayday } = useProfile();
  const toast = useToast();
  const toHome = () => router.replace("/beranda");

  return (
    <PaydayForm
      initial={profile?.payday ?? null}
      skipLabel={fromOnboarding ? "Nanti saja" : undefined}
      onSkip={fromOnboarding ? toHome : undefined}
      onBack={fromOnboarding ? toHome : () => router.back()}
      onSave={async (reminder) => {
        await ensureNotificationPermission().catch(() => "blocked");
        await updatePayday(reminder);
        await schedulePaydayNotifications(reminder.day).catch(() => {});
        if (fromOnboarding) {
          toHome();
        } else {
          toast("Pengingat gajian disimpan.");
          router.back();
        }
      }}
      onTurnOff={
        !fromOnboarding && profile?.payday
          ? async () => {
              await updatePayday(null);
              await cancelPaydayNotifications().catch(() => {});
              toast("Pengingat gajian dimatikan.");
              router.back();
            }
          : undefined
      }
    />
  );
}
