
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { getCurrentSession } from "@/lib/auth";
import { getEntryChoice, setEntryChoice } from "@/lib/entry-state";
import { useProfile } from "@/state/profile-context";
import { colors } from "@/theme";

type Destination = "home" | "welcome" | "auth";

export default function Index() {
  const { profile } = useProfile();
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveStartRoute() {
      try {
        const [choice, session] = await Promise.all([
          getEntryChoice(),
          getCurrentSession(),
        ]);

        if (cancelled) return;

        // Akun dengan sesi aktif.
        if (session) {
          await setEntryChoice("account");

          if (!cancelled) {
            setDestination(profile ? "home" : "welcome");
          }
          return;
        }

        // Pengguna yang secara eksplisit sudah logout.
        if (choice === "signed-out") {
          setDestination("auth");
          return;
        }

        // Pengguna Guest.
        if (choice === "guest") {
          setDestination(profile ? "home" : "welcome");
          return;
        }

        // Pengguna lama yang belum memiliki status pilihan akun.
        if (profile && choice === null) {
          setDestination("home");
          return;
        }

        // Pengguna baru: tampilkan halaman welcome terlebih dahulu.
        setDestination("welcome");
      } catch {
        if (!cancelled) setDestination("auth");
      }
    }

    resolveStartRoute();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (destination === "home") {
    return <Redirect href="/beranda" />;
  }

  if (destination === "welcome") {
    return <Redirect href="/welcome" />;
  }

  if (destination === "auth") {
    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg2,
  },
});
