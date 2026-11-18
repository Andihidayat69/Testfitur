import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { addMonths, monthLabel, monthOf, toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

test("History shows income, spending and difference per month; months are bounded", async () => {
  const today = toLocalDate(new Date());
  const month = monthOf(today);
  const lastMonth = addMonths(month, -1);
  const { app } = await launchApp({
    profile: onboardedProfile(),
    entries: [
      makeEntry({ occurredOn: today, type: "income", amount: 3000000, note: "Gaji" }),
      makeEntry({ occurredOn: today, category: "bills", amount: 500000 }),
      makeEntry({ occurredOn: `${lastMonth}-10`, category: "food_snacks", amount: 70000, note: "Bakso" }),
    ],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  await fireEvent.press(screen.getByText("Catat"));
  await fireEvent.press((await screen.findAllByText("Lihat semua"))[0]);
  await waitFor(() => expect(app.getPathname()).toBe("/riwayat"));

  expect(screen.getByTestId("history-month")).toHaveTextContent(monthLabel(month));
  expect(screen.getByTestId("history-difference")).toHaveTextContent("Rp2.500.000");
  expect(screen.getByText("+Rp3.000.000")).toBeTruthy();
  expect(screen.getByLabelText("Bulan berikutnya")).toBeDisabled();

  await fireEvent.press(screen.getByLabelText("Bulan sebelumnya"));
  expect(screen.getByTestId("history-month")).toHaveTextContent(monthLabel(lastMonth));
  expect(screen.getByLabelText(/^Bakso, Makan & jajan/)).toBeTruthy();
  expect(screen.getByTestId("history-difference")).toHaveTextContent("−Rp70.000");
  expect(screen.getByLabelText("Bulan sebelumnya")).toBeDisabled(); // no entries before this month
});
