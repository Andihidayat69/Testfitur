import { beforeEach, expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, reachBudgetStep } from "../test-utils/app";
import {
  notificationsMockState,
  resetNotificationsMock,
} from "../test-utils/notifications-mock";

beforeEach(() => resetNotificationsMock());

test("setting the payday reminder at the end of onboarding asks permission and schedules 3 paydays", async () => {
  const { app, store } = await launchApp();
  await reachBudgetStep([
    "Membagi uang untuk kebutuhan, tabungan, dan hiburan.",
    "Mempertimbangkan kondisi keuangan sebelum membeli.",
    "Mengurangi pengeluaran hiburan dan jajan.",
    "Memiliki anggaran tetapi sesekali melebihi batas.",
    "Membagi uang untuk tabungan dan kebutuhan pribadi.",
  ]);
  await fireEvent.press(screen.getByText("Rp800.000"));
  await fireEvent.press(screen.getByText("Simpan kuota"));
  await waitFor(() => expect(app.getPathname()).toBe("/gajian"));
  expect(screen.getByText("Kapan kamu gajian?")).toBeTruthy();

  await fireEvent.press(screen.getByText("Ingatkan aku"));
  expect(screen.getByText("Pilih tanggal gajianmu dulu, ya.")).toBeTruthy();
  expect(screen.getByText("Isi nominalnya dulu, ya.")).toBeTruthy();
  expect(notificationsMockState.requests).toBe(0); // not asked before the user saves

  await fireEvent.press(screen.getByText("Tgl 25"));
  await fireEvent.changeText(
    screen.getByTestId("payday-amount-input"),
    "300000",
  );
  await fireEvent.press(screen.getByText("Ingatkan aku"));

  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(notificationsMockState.requests).toBe(1);
  expect(await store.getProfile()).toMatchObject({
    payday: { day: 25, saveAmount: 300000 },
  });
  await waitFor(() => expect(notificationsMockState.scheduled).toHaveLength(3));
  const first = notificationsMockState.scheduled[0];
  expect(first.trigger.date.getDate()).toBe(25);
  expect(first.trigger.date.getHours()).toBe(9);
  expect(JSON.stringify(first.content)).not.toMatch(/Rp|\d{3}\.\d{3}/); // no amounts on the lock screen
});
