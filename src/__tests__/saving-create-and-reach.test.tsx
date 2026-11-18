import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";

test("create a goal, deposit, reach the target with a celebration; manual deposits keep jajan left", async () => {
  const { app, savingStore } = await launchApp({ profile: onboardedProfile(800000) });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Belum ada tujuan tabungan. Buat yang pertama, yuk.")).toBeTruthy(); // Home card

  await fireEvent.press(screen.getByText("Tabung"));
  await waitFor(() => expect(app.getPathname()).toBe("/tabung"));
  await fireEvent.press(screen.getByText("Buat tujuan baru"));
  await waitFor(() => expect(app.getPathname()).toBe("/tujuan/baru"));

  await fireEvent.press(screen.getByText("Buat tujuan"));
  expect(screen.getByText("Isi nama tujuannya dulu, ya.")).toBeTruthy();
  expect(screen.getByText("Isi targetnya dulu, ya.")).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId("goal-name-input"), "Tiket konser");
  await fireEvent.changeText(screen.getByTestId("goal-target-input"), "500000");
  await fireEvent.press(screen.getByLabelText("Konser"));
  await fireEvent.press(screen.getByText("Buat tujuan"));

  await waitFor(() => expect(app.getPathname()).toMatch(/^\/tujuan\/goal-/));
  expect(screen.getByText('Tujuan "Tiket konser" dibuat.')).toBeTruthy();
  expect(screen.getByTestId("goal-status")).toHaveTextContent("Kurang Rp500.000 lagi.");
  expect((await savingStore.listGoals())[0]).toMatchObject({ name: "Tiket konser", target: 500000, icon: "music" });

  await fireEvent.press(screen.getByText("Catat setoran"));
  await waitFor(() => expect(app.getPathname()).toBe("/setoran/baru"));
  await fireEvent.changeText(screen.getByTestId("deposit-amount-input"), "300000");
  await fireEvent.press(screen.getByText("Simpan setoran"));
  await waitFor(() => expect(app.getPathname()).toMatch(/^\/tujuan\//));
  expect(screen.getByText("Rp300.000 masuk ke Tiket konser.")).toBeTruthy();
  expect(screen.getByTestId("goal-status")).toHaveTextContent("Kurang Rp200.000 lagi.");

  // Over the remaining amount: allowed, celebrates once.
  await fireEvent.press(screen.getByText("Catat setoran"));
  await fireEvent.changeText(await screen.findByTestId("deposit-amount-input"), "250000");
  await fireEvent.press(screen.getByText("Simpan setoran"));
  await waitFor(() => expect(app.getPathname()).toBe("/setoran/tercapai"));
  expect(screen.getByText("Tujuan tercapai!")).toBeTruthy();
  expect(screen.getByText("Tiket konser sudah terkumpul Rp500.000.")).toBeTruthy();

  await fireEvent.press(screen.getByText("Kembali"));
  await waitFor(() => expect(app.getPathname()).toMatch(/^\/tujuan\//));
  expect(screen.getByTestId("goal-status")).toHaveTextContent("Tercapai! Keren banget.");
  expect((await savingStore.listGoals())[0].reachedAt).toBeInstanceOf(Date);

  await fireEvent.press(screen.getByLabelText("Kembali"));
  await waitFor(() => expect(app.getPathname()).toBe("/tabung"));
  expect(screen.getByText("Rp550.000")).toBeTruthy(); // total, including the extra
  expect(screen.getByTestId("reached-badge")).toBeTruthy();

  await fireEvent.press(screen.getByText("Beranda"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Semua tujuanmu tercapai. Keren!")).toBeTruthy();
  expect(screen.getByText("Rp800.000")).toBeTruthy(); // manual deposits never reduce jajan left
});
