
import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { answer, launchApp } from "../test-utils/app";

test(
  "back keeps the previous answer selected; back on question 1 returns to welcome",
  async () => {
    const { app } = await launchApp();

    await waitFor(() => expect(app.getPathname()).toBe("/welcome"));

    await fireEvent.press(screen.getByText("Mulai"));

    await screen.findByText("Pertanyaan 1 dari 5");

    const firstAnswer =
      "Membagi uang untuk kebutuhan, tabungan, dan hiburan.";

    await answer(firstAnswer);

    await screen.findByText("Pertanyaan 2 dari 5");

    // Return to question 1.
    await fireEvent.press(screen.getByLabelText("Kembali"));

    await screen.findByText("Pertanyaan 1 dari 5");

    // The previous answer should remain selected.
    expect(
      await screen.findByRole("radio", { name: firstAnswer }),
    ).toBeSelected();

    expect(screen.getByText("Lanjut")).toBeEnabled();

    // Return to welcome from question 1.
    await fireEvent.press(screen.getByLabelText("Kembali"));

    await waitFor(() => expect(app.getPathname()).toBe("/welcome"));
  },
  20000,
);
