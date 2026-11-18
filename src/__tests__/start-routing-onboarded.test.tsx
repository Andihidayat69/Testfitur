import { expect, test } from "@jest/globals";
import { screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";

test("a saved profile opens Beranda with the four tabs", async () => {
  const { app } = await launchApp({
    profile: onboardedProfile(750000),
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  for (const tab of ["Beranda", "Catat", "Tabung", "Misi"]) expect(screen.getAllByText(tab).length).toBeGreaterThan(0);
  expect(screen.getByText("Jajanmu masih aman!")).toBeTruthy();
});
