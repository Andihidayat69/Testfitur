import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

import { nextPaydayTimes } from "./payday";

const CHANNEL_ID = "payday";
const ID_PREFIX = "payday-";

/**
 * Local payday notifications (docs/specs/payday-reminder.md). No amounts or other financial
 * data in the text: it can show on the lock screen. Nothing leaves the device (decision 0002).
 */
const content = {
  title: "Yeay, hari gajian!",
  body: "Sisihkan tabunganmu dulu sebelum kepakai, yuk.",
};

/**
 * "blocked" means the user said no and the system will not ask again. On Android 13+ a permission
 * that was never requested reports status "denied" with canAskAgain = true, so status alone is
 * not enough to tell "not asked yet" from "refused".
 */
export type NotificationPermission = "granted" | "askable" | "blocked";

export async function notificationPermission(): Promise<NotificationPermission> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  if (granted) return "granted";
  return canAskAgain ? "askable" : "blocked";
}

/** Asks only when the system still allows asking; returns the resulting state. */
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  const current = await notificationPermission();
  if (current !== "askable") return current;
  const { granted, canAskAgain } = await Notifications.requestPermissionsAsync();
  if (granted) return "granted";
  return canAskAgain ? "askable" : "blocked";
}

export function openNotificationSettings() {
  Linking.openSettings().catch(() => {});
}

export async function cancelPaydayNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Replaces the scheduled payday notifications with the next 3. Safe to call on every app open. */
export async function schedulePaydayNotifications(day: number, now = new Date()): Promise<void> {
  await cancelPaydayNotifications();
  if ((await notificationPermission()) !== "granted") return;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Pengingat gajian",
      // Re-exported with `export *` from a .d.ts file, which import/namespace cannot follow.
      // eslint-disable-next-line import/namespace
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  for (const at of nextPaydayTimes(now, day)) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${ID_PREFIX}${at.getFullYear()}-${at.getMonth() + 1}-${at.getDate()}`,
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ID },
    });
  }
}

/** Show payday notifications even when the app is open (the Home pop-up also appears). */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}
