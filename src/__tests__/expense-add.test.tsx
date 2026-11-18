import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

test("recording a jajan expense shows jajan left in the toast and updates Catat and Home", async () => {
  const today = toLocalDate(new Date());
  const { app, entryStore } = await launchApp({
    profile: onboardedProfile(800000),
    entries: [makeEntry({ occurredOn: today, category: "food_snacks", amount: 455000, note: "Makan siang" })],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

  await fireEvent.press(screen.getByText("Catat"));
  await waitFor(() => expect(app.getPathname()).toBe("/catat"));
  expect(screen.getByText("Paling banyak: Makan & jajan")).toBeTruthy();

  await fireEvent.press(screen.getByText("Catat pengeluaran"));
  await waitFor(() => expect(app.getPathname()).toBe("/catatan/baru"));

  // Empty amount is rejected.
  await fireEvent.press(screen.getByText("Simpan"));
  expect(screen.getByText("Isi nominalnya dulu, ya.")).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId("entry-amount-input"), "25000");
  await fireEvent.changeText(screen.getByTestId("entry-note-input"), "  Kopi susu  ");
  await fireEvent.press(screen.getByText("Hiburan"));
  await fireEvent.press(screen.getByText("Simpan"));

  await waitFor(() => expect(app.getPathname()).toBe("/catat"));
  expect(screen.getByText("Tercatat. Sisa jajanmu Rp320.000.")).toBeTruthy();
  expect(screen.getByLabelText(/^Kopi susu, Hiburan · Hari ini/)).toBeTruthy();
  const saved = (await entryStore.listAll()).find((e) => e.note === "Kopi susu");
  expect(saved).toMatchObject({ type: "expense", amount: 25000, category: "entertainment", occurredOn: today });

  await fireEvent.press(screen.getByText("Beranda"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Rp320.000")).toBeTruthy();
});
