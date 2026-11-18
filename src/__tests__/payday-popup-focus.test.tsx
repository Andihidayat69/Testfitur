import { beforeEach, expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";
import { resetNotificationsMock } from "../test-utils/notifications-mock";

beforeEach(() => resetNotificationsMock({ permission: "granted" }));

// Regression: the pop-up is a Modal, which floats above every screen; it must not follow the
// user to screens opened on top of Beranda (found on the Android emulator).
test("the payday pop-up shows only while Beranda is on top", async () => {
  const day = new Date().getDate();
  const { app } = await launchApp({ profile: onboardedProfile(800000, { payday: { day, saveAmount: 300000 } }) });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(await screen.findByTestId("payday-popup")).toBeTruthy();

  await fireEvent.press(screen.getByText("Catat")); // another tab
  await waitFor(() => expect(app.getPathname()).toBe("/catat"));
  expect(screen.queryByTestId("payday-popup")).toBeNull();

  await fireEvent.press(screen.getByText("Beranda"));
  expect(await screen.findByTestId("payday-popup")).toBeTruthy(); // still unhandled
});
