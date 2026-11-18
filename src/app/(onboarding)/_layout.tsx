import { Stack } from "expo-router";

import { HabitCheckProvider } from "@/features/habit-check/habit-check-context";
import { colors } from "@/theme";

export default function OnboardingLayout() {
  return (
    <HabitCheckProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg2 } }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="question/[step]" />
        {/* The quiz is done once the result shows: no swipe back to the questions. */}
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
        <Stack.Screen name="budget" />
      </Stack>
    </HabitCheckProvider>
  );
}
