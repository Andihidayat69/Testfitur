import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";
import { pressRightAnswer } from "../test-utils/missions";

test("leaving a mission asks first and saves nothing; the same mission can be started again", async () => {
  const { app, missionStore } = await launchApp({ profile: onboardedProfile(800000) });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  await fireEvent.press(screen.getByText("Misi"));
  await fireEvent.press(await screen.findByText("Mulai misi"));
  await waitFor(() => expect(app.getPathname()).toBe("/misi-harian"));
  await screen.findByText("Pertanyaan 1 dari 3");
  await pressRightAnswer();

  // Back asks first; "Lanjut misi" stays.
  await fireEvent.press(screen.getByLabelText("Kembali"));
  expect(await screen.findByText("Keluar dari misi? Progresmu tidak disimpan.")).toBeTruthy();
  await fireEvent.press(screen.getByText("Lanjut misi"));
  await waitFor(() => expect(screen.queryByText("Keluar dari misi? Progresmu tidak disimpan.")).toBeNull());
  expect(screen.getByText("Pertanyaan 1 dari 3")).toBeTruthy();

  // Leaving for real goes back to Misi with nothing saved.
  await fireEvent.press(screen.getByLabelText("Kembali"));
  await fireEvent.press(await screen.findByText("Ya, keluar"));
  await waitFor(() => expect(app.getPathname()).toBe("/misi"));
  expect(await missionStore.listAll()).toHaveLength(0);
  expect(screen.getByText("Mulai misi")).toBeTruthy();
  expect(screen.queryByTestId("streak-chip")).toBeNull();
});
