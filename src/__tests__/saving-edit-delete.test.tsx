import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeDeposit, makeGoal } from "../test-utils/entries";

test("edit and delete a deposit, then delete a goal; Home moves to the next main goal", async () => {
  const today = toLocalDate(new Date());
  const older = makeGoal({ id: "g-old", name: "Dana darurat", icon: "shield", target: 1000000, createdAt: new Date(2025, 0, 1) });
  const newer = makeGoal({ id: "g-new", name: "HP baru", icon: "smartphone", target: 3000000, createdAt: new Date(2025, 5, 1) });
  const { app, savingStore } = await launchApp({
    profile: onboardedProfile(),
    goals: [older, newer],
    deposits: [
      makeDeposit({ goalId: "g-old", amount: 200000, occurredOn: today }),
      makeDeposit({ goalId: "g-old", amount: 100000, occurredOn: today }),
    ],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Tujuan utama")).toBeTruthy();
  expect(screen.getByLabelText(/^Dana darurat, 30 persen/)).toBeTruthy();

  await fireEvent.press(screen.getByLabelText(/^Dana darurat, 30 persen/));
  await waitFor(() => expect(app.getPathname()).toBe("/tujuan/g-old"));

  // Edit the Rp200.000 deposit to Rp250.000.
  await fireEvent.press(screen.getByLabelText(/^Setoran Rp200\.000/));
  await waitFor(() => expect(app.getPathname()).toMatch(/^\/setoran\//));
  await fireEvent.changeText(screen.getByTestId("deposit-amount-input"), "250000");
  await fireEvent.press(screen.getByText("Simpan setoran"));
  await waitFor(() => expect(app.getPathname()).toBe("/tujuan/g-old"));
  expect(screen.getByTestId("goal-status")).toHaveTextContent("Kurang Rp650.000 lagi.");

  // Delete the Rp100.000 deposit.
  await fireEvent.press(screen.getByLabelText(/^Setoran Rp100\.000/));
  await fireEvent.press(await screen.findByText("Hapus setoran"));
  await fireEvent.press(screen.getByText("Hapus"));
  await waitFor(() => expect(app.getPathname()).toBe("/tujuan/g-old"));
  expect(screen.getByText("Setoran dihapus.")).toBeTruthy();
  expect(screen.getByTestId("goal-status")).toHaveTextContent("Kurang Rp750.000 lagi.");

  // Delete the goal: cancel first, then confirm; its deposits go with it.
  await fireEvent.press(screen.getByText("Hapus tujuan"));
  expect(screen.getByText("Hapus tujuan ini? Setorannya juga ikut terhapus.")).toBeTruthy();
  await fireEvent.press(screen.getByText("Batal"));
  await fireEvent.press(screen.getByText("Hapus tujuan"));
  await fireEvent.press(screen.getByText("Hapus"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Tujuan dihapus.")).toBeTruthy();
  expect((await savingStore.listGoals()).map((g) => g.id)).toEqual(["g-new"]);
  expect(await savingStore.listDeposits()).toHaveLength(0);
  expect(screen.getByLabelText(/^HP baru, 0 persen/)).toBeTruthy(); // next main goal
});
