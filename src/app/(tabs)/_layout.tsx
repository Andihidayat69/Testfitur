import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

import { colors, fontFamily } from "@/theme";

type IconName = ComponentProps<typeof Feather>["name"];

function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <Feather name={name} size={24} color={color as string} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 14 },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.bg1, minHeight: 64 },
        sceneStyle: { backgroundColor: colors.bg2 },
      }}
    >
      <Tabs.Screen name="beranda" options={{ title: "Beranda", tabBarIcon: tabIcon("home") }} />
      <Tabs.Screen name="catat" options={{ title: "Catat", tabBarIcon: tabIcon("plus-circle") }} />
      <Tabs.Screen name="tabung" options={{ title: "Tabung", tabBarIcon: tabIcon("target") }} />
      <Tabs.Screen name="misi" options={{ title: "Misi", tabBarIcon: tabIcon("flag") }} />
    </Tabs>
  );
}
