import { beforeEach, expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";
import { notificationsMockState, resetNotificationsMock } from "../test-utils/notifications-mock";

beforeEach(() => resetNotificationsMock({ permission: "denied" }));

test("from Profil: set a custom day with notifications off, then change and turn it off", async () => {
  const { app, store } = await launchApp({ profile: onboardedProfile() });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  await fireEvent.press(screen.getByLabelText("Profil"));
  expect(await screen.findByTestId("profile-payday")).toHaveTextContent("Belum diatur");

  await fireEvent.press(screen.getByText("Atur pengingat"));
  await waitFor(() => expect(app.getPathname()).toBe("/gajian"));
  // Permission was denied before: the form says the Home pop-up still works.
  expect(await screen.findByTestId("notifications-denied")).toBeTruthy();

  await fireEvent.press(screen.getByText("Tanggal lain"));
  await fireEvent.press(screen.getByLabelText("Tanggal 31"));
  expect(screen.getByText("Tgl 31")).toBeTruthy();
  await fireEvent.changeText(screen.getByTestId("payday-amount-input"), "500000");
  await fireEvent.press(screen.getByText("Ingatkan aku"));

  await waitFor(() => expect(app.getPathname()).toBe("/profil"));
  expect(screen.getByText("Pengingat gajian disimpan.")).toBeTruthy();
  expect(screen.getByTestId("profile-payday")).toHaveTextContent("Tgl 31 · Rp500.000");
  expect(notificationsMockState.requests).toBe(0); // already denied: not asked again
  expect(notificationsMockState.scheduled).toHaveLength(0); // nothing scheduled without permission

  await fireEvent.press(screen.getByText("Ubah pengingat"));
  await fireEvent.press(await screen.findByText("Matikan pengingat"));
  await waitFor(() => expect(app.getPathname()).toBe("/profil"));
  expect(screen.getByTestId("profile-payday")).toHaveTextContent("Belum diatur");
  expect((await store.getProfile())?.payday).toBeNull();
});
