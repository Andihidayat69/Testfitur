
import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { launchApp, onboardedProfile } from "../test-utils/app";

test(
  "Home starts safe; editing the budget from Profil updates Home",
  async () => {
    const { app, store } = await launchApp({
      profile: onboardedProfile(800000),
    });

    await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

    expect(screen.getByText("Jajanmu masih aman!")).toBeTruthy();
    expect(screen.getByTestId("mascot-jempol")).toBeTruthy();
    expect(screen.getByText("Rp800.000")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Profil"));

    await waitFor(() => expect(app.getPathname()).toBe("/profil"));

    expect(screen.getByText("The Impulsive")).toBeTruthy();

    const { expo } = require("../../app.json");

    expect(screen.getByTestId("app-version")).toHaveTextContent(
      `Versi ${expo.version} (${expo.android.versionCode})`,
    );

    expect(screen.getByTestId("profile-budget")).toHaveTextContent(
      "Rp800.000",
    );

    await fireEvent.press(screen.getByText("Ubah kuota"));

    await waitFor(() => expect(app.getPathname()).toBe("/kuota"));

    // Budget input should be pre-filled with the existing value.
    expect(screen.getByTestId("jajan-budget-input").props.value).toBe(
      "800.000",
    );

    await fireEvent.press(screen.getByText("Rp1.000.000"));
    await fireEvent.press(screen.getByText("Simpan kuota"));

    await waitFor(() => expect(app.getPathname()).toBe("/profil"));

    expect(screen.getByTestId("profile-budget")).toHaveTextContent(
      "Rp1.000.000",
    );

    expect(await store.getProfile()).toMatchObject({
      jajanBudget: 1000000,
    });

    await fireEvent.press(screen.getByLabelText("Kembali"));

    await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

    expect(screen.getByText("Rp1.000.000")).toBeTruthy();
    expect(
      screen.getByText("dari kuota Rp1.000.000"),
    ).toBeTruthy();
  },
  20000,
);
