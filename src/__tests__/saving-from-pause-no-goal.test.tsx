import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";

test("moving to saving with no goals creates a goal first, then keeps the amount", async () => {
  const { app, savingStore } = await launchApp({ profile: onboardedProfile(800000) });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

  await fireEvent.press(screen.getByText("Tahan dulu"));
  await fireEvent.changeText(await screen.findByTestId("pause-item-input"), "Jaket");
  await fireEvent.changeText(screen.getByTestId("pause-price-input"), "250000");
  await fireEvent.press(screen.getByText("Cek sisa jajan"));
  await fireEvent.press(await screen.findByText("Lanjut"));
  await fireEvent.press(await screen.findByText("Tunda dulu"));
  await fireEvent.press(await screen.findByText("Pindahkan ke tabungan"));

  await waitFor(() => expect(app.getPathname()).toBe("/tujuan/baru"));
  expect(screen.getByText("Buat tujuan dulu, yuk.")).toBeTruthy();
  await fireEvent.changeText(screen.getByTestId("goal-name-input"), "Dana darurat");
  await fireEvent.changeText(screen.getByTestId("goal-target-input"), "2000000");
  await fireEvent.press(screen.getByText("Buat tujuan"));

  await waitFor(() => expect(app.getPathname()).toBe("/setoran/baru"));
  expect(screen.getByTestId("deposit-amount-input").props.value).toBe("250.000");
  await fireEvent.press(screen.getByText("Simpan setoran"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Rp550.000")).toBeTruthy(); // 800.000 − 250.000
  expect((await savingStore.listDeposits())[0]).toMatchObject({ amount: 250000, source: "pause" });
});
