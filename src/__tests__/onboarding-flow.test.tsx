
import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { answer, launchApp } from "../test-utils/app";

test(
  "welcome → five answers → result → budget → Beranda, and the profile is saved",
  async () => {
    const { app, store } = await launchApp();

    await waitFor(() => expect(app.getPathname()).toBe("/welcome"));
    expect(screen.getByText("Hai, aku teman jajanmu!")).toBeTruthy();

    await fireEvent.press(screen.getByText("Mulai"));

    await screen.findByText("Pertanyaan 1 dari 5");
    expect(screen.getByText("Lanjut")).toBeDisabled();

    await answer("Membagi uang untuk kebutuhan, tabungan, dan hiburan.");
    await screen.findByText("Pertanyaan 2 dari 5");

    await answer("Membeli jika memang dibutuhkan.");
    await screen.findByText("Pertanyaan 3 dari 5");

    await answer("Mengevaluasi pengeluaran dan menyusun ulang anggaran.");
    await screen.findByText("Pertanyaan 4 dari 5");

    await answer("Selalu memiliki batas anggaran.");
    await screen.findByText("Pertanyaan 5 dari 5");

    await answer("Membagi uang untuk tabungan dan kebutuhan pribadi.");

    expect(await screen.findByText("The Planner")).toBeTruthy();
    expect(app.getPathname()).toBe("/result");
    expect(await store.getProfile()).toBeNull();

    await fireEvent.press(screen.getByText("Lanjut"));

    await screen.findByText("Berapa kuota jajanmu sebulan?");

    // Isi nama panggilan sebelum menyimpan profil.
    await fireEvent.changeText(
      screen.getByTestId("profile-name-input"),
      "Andi",
    );

    await fireEvent.press(screen.getByText("Rp800.000"));

    expect(screen.getByTestId("jajan-budget-input").props.value).toBe(
      "800.000",
    );

    await fireEvent.press(screen.getByText("Simpan kuota"));

    await waitFor(() => expect(app.getPathname()).toBe("/gajian"));

    expect(await store.getProfile()).not.toBeNull();

    await fireEvent.press(screen.getByText("Nanti saja"));

    await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

    const saved = await store.getProfile();

    expect(saved).toMatchObject({
      name: "Andi",
      habitType: "planner",
      jajanBudget: 800000,
      payday: null,
    });

    expect(saved?.onboardingCompletedAt).toBeInstanceOf(Date);

    for (const tab of ["Beranda", "Catat", "Tabung", "Misi"]) {
      expect(screen.getAllByText(tab).length).toBeGreaterThan(0);
    }
  },
  20000,
);
