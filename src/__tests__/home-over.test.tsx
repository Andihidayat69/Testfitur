import { expect, test } from "@jest/globals";
import { screen, waitFor } from "expo-router/testing-library";

import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

test("Home shows a negative jajan left and the over mood without blaming", async () => {
  const today = toLocalDate(new Date());
  const { app } = await launchApp({
    profile: onboardedProfile(500000),
    entries: [makeEntry({ occurredOn: today, category: "entertainment", amount: 525000 })],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("−Rp25.000")).toBeTruthy();
  expect(screen.getByText("Kuota jajanmu sudah lewat. Tenang, bulan depan mulai lagi.")).toBeTruthy();
  expect(screen.getByTestId("mascot-kaget")).toBeTruthy();
});
