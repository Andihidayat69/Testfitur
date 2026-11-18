import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Mascot, ToastProvider } from "@/components";
import type { EntryStore } from "@/db/entry-store";
import type { MissionStore } from "@/db/mission-store";
import { openAppStores } from "@/db/open";
import type { PauseStore } from "@/db/pause-store";
import type { Profile, ProfileStore } from "@/db/profile-store";
import type { SavingStore } from "@/db/saving-store";
import type { Entry } from "@/features/expenses/entry";
import type { Mission } from "@/features/missions/missions";
import type { Pause } from "@/features/pause/pause";
import {
  configureNotificationHandler,
  schedulePaydayNotifications,
} from "@/features/payday/notifications";
import type { Deposit, SavingGoal } from "@/features/saving/goals";
import { EntriesProvider } from "@/state/entries-context";
import { MissionsProvider } from "@/state/missions-context";
import { PausesProvider } from "@/state/pauses-context";
import { ProfileProvider, useProfile } from "@/state/profile-context";
import { SavingsProvider } from "@/state/savings-context";
import { colors, layout } from "@/theme";
import { appFonts } from "@/theme/fonts";

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotificationHandler();

type Ready = {
  profileStore: ProfileStore;
  profile: Profile | null;
  entryStore: EntryStore;
  entries: Entry[];
  pauseStore: PauseStore;
  pauses: Pause[];
  savingStore: SavingStore;
  goals: SavingGoal[];
  deposits: Deposit[];
  missionStore: MissionStore;
  missions: Mission[];
};

export default function RootLayout() {
  // Fonts that fail to load fall back to the system font (error is non-null), not a blank screen.
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const [ready, setReady] = useState<Ready | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stores = await openAppStores();
        const [profile, entries, pauses, goals, deposits, missions] =
          await Promise.all([
            stores.profile.getProfile(),
            stores.entries.listAll(),
            stores.pauses.listAll(),
            stores.saving.listGoals(),
            stores.saving.listDeposits(),
            stores.missions.listAll(),
          ]);
        if (!cancelled) {
          setReady({
            profileStore: stores.profile,
            profile,
            entryStore: stores.entries,
            entries,
            pauseStore: stores.pauses,
            pauses,
            savingStore: stores.saving,
            goals,
            deposits,
            missionStore: stores.missions,
            missions,
          });
        }
      } catch (e) {
        // Never log details in production: the error may carry user data. In development builds
        // only the message is printed, to find why the database could not be opened.
        if (__DEV__) console.warn("startup failed:", (e as Error).message);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fontsDone = fontsLoaded || fontError !== null;
  const done = fontsDone && (ready !== null || failed);

  useEffect(() => {
    if (done) SplashScreen.hideAsync().catch(() => {});
  }, [done]);

  if (!done) return null;
  if (failed || !ready) return <StartupError />;

  return (
    <ProfileProvider store={ready.profileStore} initialProfile={ready.profile}>
      <EntriesProvider store={ready.entryStore} initialEntries={ready.entries}>
        <SavingsProvider
          store={ready.savingStore}
          initialGoals={ready.goals}
          initialDeposits={ready.deposits}
        >
          <PausesProvider store={ready.pauseStore} initialPauses={ready.pauses}>
            <MissionsProvider
              store={ready.missionStore}
              initialMissions={ready.missions}
            >
              <ToastProvider>
                <StatusBar style="dark" />
                <RootStack />
              </ToastProvider>
            </MissionsProvider>
          </PausesProvider>
        </SavingsProvider>
      </EntriesProvider>
    </ProfileProvider>
  );
}

function RootStack() {
  const { profile } = useProfile();
  const onboarded = profile !== null;
  const paydayDay = profile?.payday?.day ?? null;

  // Top up the next 3 payday notifications on every app open (docs/specs/payday-reminder.md).
  useEffect(() => {
    if (paydayDay !== null)
      schedulePaydayNotifications(paydayDay).catch(() => {});
  }, [paydayDay]);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg2 },
      }}
    >
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profil" />
        <Stack.Screen name="kuota" />
        <Stack.Screen name="catatan/baru" />
        <Stack.Screen name="catatan/[id]" />
        <Stack.Screen name="riwayat" />
        <Stack.Screen name="tahan" />
        <Stack.Screen name="tujuan/baru" />
        <Stack.Screen name="tujuan/[id]" />
        <Stack.Screen name="tujuan/ubah/[id]" />
        <Stack.Screen name="setoran/baru" />
        <Stack.Screen name="setoran/[id]" />
        <Stack.Screen name="setoran/tercapai" />
        <Stack.Screen name="gajian" />
        {/* Leaving a mission asks first, so no swipe back. */}
        <Stack.Screen name="misi-harian" options={{ gestureEnabled: false }} />
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="test-misi" />
          <Stack.Screen name="test-misi-kuis" />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
}

function StartupError() {
  return (
    <View style={styles.error}>
      <Mascot pose="sedih" height={160} float={false} />
      <AppText variant="title" align="center">
        Maaf, aplikasinya belum bisa dibuka.
      </AppText>
      <AppText align="center">Tutup lalu buka lagi, ya.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: layout.sideMargin,
    backgroundColor: colors.bg2,
  },
});
