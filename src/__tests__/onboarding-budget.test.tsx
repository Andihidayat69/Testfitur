import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, reachBudgetStep } from "../test-utils/app";

test("budget: empty shows an error and a typed amount is saved with balanced profile", async () => {
  const { app, store } = await launchApp();

  await reachBudgetStep([
    "Membagi uang untuk kebutuhan, tabungan, dan hiburan.",
    "Mempertimbangkan kondisi keuangan sebelum membeli.",
    "Mengevaluasi pengeluaran dan menyusun ulang anggaran.",
    "Memiliki anggaran tetapi sesekali melebihi batas.",
    "Membagi uang untuk tabungan dan kebutuhan pribadi.",
  ]);

  expect(screen.getByTestId("jajan-budget-input").props.value).toBe("");

  await fireEvent.press(screen.getByText("Simpan kuota"));

  expect(screen.getByText("Isi kuota jajanmu dulu, ya.")).toBeTruthy();
  expect(await store.getProfile()).toBeNull();

  await fireEvent.changeText(
    screen.getByTestId("jajan-budget-input"),
    "1.234.567",
  );

  expect(screen.queryByText("Isi kuota jajanmu dulu, ya.")).toBeNull();
  expect(screen.getByTestId("jajan-budget-input").props.value).toBe(
    "1.234.567",
  );

  await fireEvent.press(screen.getByText("Simpan kuota"));

  await waitFor(() => expect(app.getPathname()).toBe("/gajian"));

  expect(await store.getProfile()).toMatchObject({
    jajanBudget: 1234567,
    habitType: "balanced",
  });
});
