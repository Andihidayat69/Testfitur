import { beforeEach, expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeGoal } from "../test-utils/entries";
import { resetNotificationsMock } from "../test-utils/notifications-mock";

beforeEach(() => resetNotificationsMock({ permission: "granted" }));

test("on payday the pop-up leads to a deposit that does not reduce jajan left, and does not come back", async () => {
  const day = new Date().getDate(); // today is payday
  const { app, savingStore, store } = await launchApp({
    profile: onboardedProfile(800000, { payday: { day, saveAmount: 300000 } }),
    goals: [makeGoal({ id: "g1", name: "Dana darurat", target: 3000000 })],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(await screen.findByTestId("payday-popup")).toBeTruthy();
  expect(screen.getByText("Sisihkan Rp300.000 dulu sebelum kepakai, yuk.")).toBeTruthy();
  expect(screen.getByTestId("mascot-cek-hp")).toBeTruthy();

  await fireEvent.press(screen.getByText("Sisihkan sekarang"));
  await waitFor(() => expect(app.getPathname()).toBe("/setoran/baru"));
  expect(screen.getByTestId("deposit-amount-input").props.value).toBe("300.000");
  expect(screen.getByRole("radio", { name: "Dana darurat" })).toBeSelected();
  expect(screen.queryByText("Diambil dari sisa jajanmu bulan ini.")).toBeNull();

  await fireEvent.press(screen.getByText("Simpan setoran"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.queryByTestId("payday-popup")).toBeNull(); // handled for this payday
  expect(screen.getByText("Rp800.000")).toBeTruthy(); // salary deposit: jajan left unchanged
  expect((await savingStore.listDeposits())[0]).toMatchObject({ amount: 300000, source: "manual", goalId: "g1" });
  expect((await store.getProfile())?.paydayHandledFor).not.toBeNull();
});
