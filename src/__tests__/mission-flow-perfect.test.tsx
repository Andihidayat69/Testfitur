import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { currentQuestion, pressRightAnswer } from "../test-utils/missions";

test("a perfect mission: 3 right answers, result, points and streak, done state, points on Home", async () => {
  const { app, missionStore } = await launchApp({
    profile: onboardedProfile(800000),
  });

  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.queryByTestId("points-chip")).toBeNull();

  await fireEvent.press(screen.getByText("Misi"));
  await waitFor(() => expect(app.getPathname()).toBe("/misi"));

  expect(screen.getByText("Misi hari ini")).toBeTruthy();
  expect(screen.getByText("3 pertanyaan singkat · +10 poin")).toBeTruthy();
  expect(screen.queryByTestId("streak-chip")).toBeNull();

  await fireEvent.press(screen.getByText("Mulai misi"));
  await waitFor(() => expect(app.getPathname()).toBe("/misi-harian"));

  for (const n of [1, 2, 3]) {
    expect(await screen.findByText(`Pertanyaan ${n} dari 3`)).toBeTruthy();
    expect(screen.queryByTestId("mission-feedback")).toBeNull();

    const question = currentQuestion();
    await pressRightAnswer(question);

    expect(screen.getByText("Betul!")).toBeTruthy();

    await fireEvent.press(screen.getByText(n === 3 ? "Lihat hasil" : "Lanjut"));
  }

  expect(await screen.findByText("Misi selesai!")).toBeTruthy();
  expect(screen.getByText("3/3 betul")).toBeTruthy();
  expect(screen.getByTestId("points-earned")).toHaveTextContent(/30 poin$/);
  expect(screen.getByTestId("mascot-juara")).toBeTruthy();

  const [saved] = await missionStore.listAll();

  expect(saved).toMatchObject({
    doneOn: toLocalDate(new Date()),
    level: 1,
    correct: 3,
    points: 30,
  });

  expect(saved.questionIds).toHaveLength(3);

  await fireEvent.press(screen.getByText("Kembali ke misi"));
  await waitFor(() => expect(app.getPathname()).toBe("/misi"));

  expect(screen.getByText("Misi hari ini selesai")).toBeTruthy();
  expect(screen.getByText("Besok ada misi baru, ya.")).toBeTruthy();
  expect(screen.queryByText("Mulai misi")).toBeNull();

  expect(screen.getByTestId("streak-chip")).toHaveTextContent(/1 hari$/);
  expect(screen.getByTestId("mission-points-chip")).toHaveTextContent(
    /30 poin$/,
  );

  await fireEvent.press(screen.getByText("Beranda"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

  expect(screen.getByTestId("points-chip")).toHaveTextContent(/(^|\D)30 poin$/);
});
