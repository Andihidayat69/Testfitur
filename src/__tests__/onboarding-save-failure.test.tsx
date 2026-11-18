import { expect, test } from "@jest/globals";
import { fireEvent, screen } from "expo-router/testing-library";

import { launchApp, reachBudgetStep } from "../test-utils/app";

test("a failed save keeps the user on the budget step with the input intact", async () => {
  const { app } = await launchApp({ failSaves: true });
  await reachBudgetStep([
    "Membagi uang untuk kebutuhan, tabungan, dan hiburan.",
    "Mempertimbangkan kondisi keuangan sebelum membeli.",
    "Mengurangi pengeluaran hiburan dan jajan.",
    "Memiliki anggaran tetapi sesekali melebihi batas.",
    "Membagi uang untuk tabungan dan kebutuhan pribadi.",
  ]);

  await fireEvent.press(screen.getByText("Rp500.000"));
  await fireEvent.press(screen.getByText("Simpan kuota"));
  expect(
    await screen.findByText("Maaf, belum berhasil disimpan. Coba lagi, ya."),
  ).toBeTruthy();
  expect(screen.getByTestId("mascot-sedih")).toBeTruthy();
  expect(app.getPathname()).toBe("/budget");
  expect(screen.getByTestId("jajan-budget-input").props.value).toBe("500.000");
});
