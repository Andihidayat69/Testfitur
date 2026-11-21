import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppText, Button, Card, Pad, Screen, StepHeader } from "@/components";
import { habitTypeContent } from "@/features/habit-check/habit-types";
import { appVersionLabel } from "@/lib/app-version";
import { signOut } from "@/lib/auth";
import { setEntryChoice } from "@/lib/entry-state";
import { formatRupiah } from "@/lib/money";
import { useProfile } from "@/state/profile-context";

export default function Profil() {
  const { profile } = useProfile();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!profile) return null;

  function confirmLogout() {
    Alert.alert(
      "Keluar dari akun?",
      "Kamu akan keluar dari akun Jajan Tenang. Data lokal di perangkat ini tidak akan dihapus.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: handleLogout,
        },
      ],
    );
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await signOut();

      if (error) throw error;

      await setEntryChoice("signed-out");
      router.replace("/auth");
    } catch (error) {
      Alert.alert(
        "Logout gagal",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Screen header={<StepHeader label="Profil" onBack={() => router.back()} />}>
      <Pad gap={16}>
        <Card>
          <AppText variant="caption">Tipe kebiasaanmu</AppText>
          <AppText variant="title">
            {habitTypeContent[profile.habitType].name}
          </AppText>
        </Card>

        <Card>
          <View style={styles.row}>
            <View style={styles.grow}>
              <AppText variant="caption">Kuota jajan bulanan</AppText>
              <AppText variant="title" testID="profile-budget">
                {formatRupiah(profile.jajanBudget)}
              </AppText>
            </View>
          </View>

          <Button
            label="Ubah kuota"
            variant="secondary"
            onPress={() => router.push("/kuota")}
          />
        </Card>

        <Card>
          <AppText variant="caption">Pengingat gajian</AppText>
          <AppText variant="title" testID="profile-payday">
            {profile.payday
              ? `Tgl ${profile.payday.day} · ${formatRupiah(profile.payday.saveAmount)}`
              : "Belum diatur"}
          </AppText>

          <Button
            label={profile.payday ? "Ubah pengingat" : "Atur pengingat"}
            variant="secondary"
            onPress={() => router.push("/gajian")}
          />
        </Card>

        <Card>
          <AppText variant="caption">Akun Jajan Tenang</AppText>
          <AppText variant="body">
            Akunmu terhubung dengan layanan autentikasi Jajan Tenang.
          </AppText>

          <Button
            label={loggingOut ? "Sedang keluar..." : "Keluar dari Akun"}
            variant="secondary"
            onPress={confirmLogout}
            disabled={loggingOut}
          />
        </Card>

        <AppText
          variant="caption"
          align="center"
          style={styles.version}
          testID="app-version"
        >
          Versi {appVersionLabel()}
        </AppText>
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  version: {
    marginTop: 8,
    opacity: 0.7,
  },
});
