import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

test("buying when jajan is short: warning, expense recorded in the chosen category, Home and Catat updated", async () => {
  const today = toLocalDate(new Date());
  const { app, pauseStore, entryStore } = await launchApp({
    profile: onboardedProfile(500000),
    entries: [makeEntry({ occurredOn: today, category: "food_snacks", amount: 450000 })],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

  await fireEvent.press(screen.getByText("Tahan dulu"));
  await fireEvent.changeText(await screen.findByTestId("pause-item-input"), "Tiket nonton");
  await fireEvent.changeText(screen.getByTestId("pause-price-input"), "75000");
  await fireEvent.press(screen.getByText("Hiburan"));
  await fireEvent.press(screen.getByText("Cek sisa jajan"));

  await waitFor(() => expect(app.getPathname()).toBe("/tahan/dampak"));
  expect(screen.getByText("−Rp25.000")).toBeTruthy(); // 50.000 − 75.000
  expect(screen.getByText("Sisa jajanmu nggak cukup buat ini.")).toBeTruthy();
  expect(screen.getByTestId("mascot-kaget")).toBeTruthy();

  await fireEvent.press(screen.getByText("Lanjut"));
  await fireEvent.press(await screen.findByText("Tetap beli"));
  await waitFor(() => expect(app.getPathname()).toBe("/tahan/hasil"));
  expect(screen.getByText("Oke, sudah dicatat")).toBeTruthy();
  expect(screen.getByText("Selamat menikmati Tiket nonton!")).toBeTruthy();
  expect(screen.getByText("−Rp25.000")).toBeTruthy();

  const expense = (await entryStore.listAll()).find((e) => e.note === "Tiket nonton");
  expect(expense).toMatchObject({ type: "expense", amount: 75000, category: "entertainment", occurredOn: today });
  const [pause] = await pauseStore.listAll();
  expect(pause).toMatchObject({ decision: "buy", points: 0, entryId: expense?.id });

  await fireEvent.press(screen.getByText("Kembali ke beranda"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Kuota jajanmu sudah lewat. Tenang, bulan depan mulai lagi.")).toBeTruthy();
  expect(screen.queryByTestId("points-chip")).toBeNull();

  await fireEvent.press(screen.getByText("Catat"));
  expect(await screen.findByLabelText(/^Tiket nonton, Hiburan · Hari ini/)).toBeTruthy();
});
