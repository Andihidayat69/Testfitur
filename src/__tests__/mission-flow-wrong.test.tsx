import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";
import {
  currentQuestion,
  pressRightAnswer,
  pressWrongAnswer,
} from "../test-utils/missions";

test("wrong answers get kind feedback and earn points based on correct answers (2 of 3 right)", async () => {
  const { app, missionStore } = await launchApp({
    profile: onboardedProfile(800000),
  });

  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  await fireEvent.press(screen.getByText("Misi"));
  await fireEvent.press(await screen.findByText("Mulai misi"));
  await waitFor(() => expect(app.getPathname()).toBe("/misi-harian"));

  // Question 1: wrong answer.
  await screen.findByText("Pertanyaan 1 dari 3");

  const first = currentQuestion();
  await pressWrongAnswer(first);

  expect(screen.getByText("Hampir!")).toBeTruthy();
  expect(screen.queryByText("Salah")).toBeNull();

  // Answers are locked after selection.
  await pressRightAnswer(first);
  expect(screen.getByText("Hampir!")).toBeTruthy();

  await fireEvent.press(screen.getByText("Lanjut"));

  // Questions 2 and 3: right answers.
  await screen.findByText("Pertanyaan 2 dari 3");
  await pressRightAnswer();
  await fireEvent.press(screen.getByText("Lanjut"));

  await screen.findByText("Pertanyaan 3 dari 3");
  await pressRightAnswer();
  await fireEvent.press(screen.getByText("Lihat hasil"));

  expect(await screen.findByText("2/3 betul")).toBeTruthy();
  expect(screen.getByTestId("points-earned")).toHaveTextContent(/\+20 poin$/);
  expect(screen.getByTestId("mascot-jempol")).toBeTruthy();

  const [saved] = await missionStore.listAll();

  expect(saved).toMatchObject({
    correct: 2,
    points: 20,
  });
});
