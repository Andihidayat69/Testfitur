import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText, Button, Card, Pad, Screen } from "@/components";
import { MAX_MISSION_LEVEL } from "@/features/missions/missions";

export default function TestMission() {
  const [level, setLevel] = useState(1);

  return (
    <Screen>
      <ScrollView>
        <Pad gap={16}>
          <AppText variant="heading">Test Mode Misi</AppText>
          <AppText>
            Pilih level untuk menguji pertanyaan tanpa menyimpan poin atau
            riwayat misi pengguna.
          </AppText>

          <Card>
            <AppText variant="title">Pilih level</AppText>
            <View style={styles.levels}>
              {Array.from({ length: MAX_MISSION_LEVEL }, (_, i) => i + 1).map(
                (item) => (
                  <View key={item} style={styles.level}>
                    <Button label={`${item}`} onPress={() => setLevel(item)} />
                  </View>
                ),
              )}
            </View>
            <AppText>Level dipilih: {level}</AppText>
          </Card>

          <Button
            label="Mulai simulasi"
            onPress={() =>
              router.push({
                pathname: "/test-misi-kuis",
                params: { level: String(level) },
              })
            }
          />
          <Button label="Kembali" onPress={() => router.back()} />
        </Pad>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  levels: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  level: {
    width: 48,
  },
});
