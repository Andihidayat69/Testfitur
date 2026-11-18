import { Stack } from "expo-router";

import { PauseDraftProvider } from "@/features/pause/pause-draft-context";
import { colors } from "@/theme";

export default function PauseLayout() {
  return (
    <PauseDraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg2 } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dampak" />
        <Stack.Screen name="pikir" />
        {/* The decision is final: no swipe back from the result. */}
        <Stack.Screen name="hasil" options={{ gestureEnabled: false }} />
      </Stack>
    </PauseDraftProvider>
  );
}
