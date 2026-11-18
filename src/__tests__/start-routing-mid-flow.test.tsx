
import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { answer, launchApp } from "../test-utils/app";

// Closing the app mid-flow: quiz answers live only in memory,
// so nothing reaches the store before the budget step.
test(
  "answers before the budget step are not saved; an empty store opens welcome",
  async () => {
    const { app, store } = await launchApp();

    await waitFor(() => expect(app.getPathname()).toBe("/welcome"));

    await fireEvent.press(screen.getByText("Mulai"));

    await screen.findByText("Pertanyaan 1 dari 5");

    // Answer the first three current onboarding questions.
    await answer("Membagi uang untuk kebutuhan, tabungan, dan hiburan.");
    await answer("Membeli jika memang dibutuhkan.");
    await answer("Mengevaluasi pengeluaran dan menyusun ulang anggaran.");

    await screen.findByText("Pertanyaan 4 dari 5");

    // Profile must not be saved before the budget step.
    expect(await store.getProfile()).toBeNull();

    // Confirm the user is still in the onboarding flow.
    expect(app.getPathname()).toContain("/question/");
  },
  20000,
);
