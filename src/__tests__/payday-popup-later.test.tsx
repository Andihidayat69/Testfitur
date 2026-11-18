import { beforeEach, expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { latestPayday } from "../features/payday/payday";
import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { resetNotificationsMock } from "../test-utils/notifications-mock";

beforeEach(() => resetNotificationsMock({ permission: "granted" }));

test('"Nanti saja" hides the pop-up for this payday', async () => {
  const today = new Date();
  const day = today.getDate();
  const { app, store } = await launchApp({ profile: onboardedProfile(800000, { payday: { day, saveAmount: 300000 } }) });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  await fireEvent.press(await screen.findByText("Nanti saja"));
  await waitFor(() => expect(screen.queryByTestId("payday-popup")).toBeNull());
  expect((await store.getProfile())?.paydayHandledFor).toBe(latestPayday(toLocalDate(today), day));
});
