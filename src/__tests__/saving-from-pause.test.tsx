import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeGoal } from "../test-utils/entries";

test("after waiting, moving the money to saving fills the main goal and reduces jajan left", async () => {
  const { app, savingStore, pauseStore } = await launchApp({
    profile: onboardedProfile(800000),
    goals: [
      makeGoal({ id: "g1", name: "Tiket konser", target: 1500000, createdAt: new Date(2025, 0, 1) }),
      makeGoal({ id: "g2", name: "Liburan", icon: "map", target: 5000000, createdAt: new Date(2025, 3, 1) }),
    ],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

  await fireEvent.press(screen.getByText("Tahan dulu"));
  await fireEvent.changeText(await screen.findByTestId("pause-item-input"), "Sepatu sneakers");
  await fireEvent.changeText(screen.getByTestId("pause-price-input"), "400000");
  await fireEvent.press(screen.getByText("Cek sisa jajan"));
  await fireEvent.press(await screen.findByText("Lanjut"));
  await fireEvent.press(await screen.findByText("Tunda dulu"));
  await fireEvent.press(await screen.findByText("Pindahkan ke tabungan"));

  await waitFor(() => expect(app.getPathname()).toBe("/setoran/baru"));
  expect(screen.getByTestId("deposit-amount-input").props.value).toBe("400.000"); // full price
  expect(screen.getByText("Boleh ubah nominalnya.")).toBeTruthy();
  expect(screen.getByText("Diambil dari sisa jajanmu bulan ini.")).toBeTruthy();
  expect(screen.getByRole("radio", { name: "Tiket konser" })).toBeSelected(); // main goal

  await fireEvent.press(screen.getByText("Simpan setoran"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Rp400.000 pindah dari jajan ke tabungan. Keren!")).toBeTruthy();
  expect(screen.getByText("Rp400.000")).toBeTruthy(); // jajan left: 800.000 − 400.000

  const [pause] = await pauseStore.listAll();
  const [deposit] = await savingStore.listDeposits();
  expect(deposit).toMatchObject({ goalId: "g1", amount: 400000, source: "pause", pauseId: pause.id });
});
