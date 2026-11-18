
import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { addDays, toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeMission } from "../test-utils/missions";

test(
  "with yesterday's mission done and today's not, the streak holds and a mission can start",
  async () => {
    const today = toLocalDate(new Date());

    const { app } = await launchApp({
      profile: onboardedProfile(800000),
      missions: [
        makeMission({ doneOn: addDays(today, -2) }),
        makeMission({ doneOn: addDays(today, -1) }),
      ],
    });

    await waitFor(() => expect(app.getPathname()).toBe("/beranda"));

    // Points from past completed missions already show on Home.
    expect(screen.getByTestId("points-chip")).toHaveTextContent(
      /(^|\D)60 poin$/,
    );

    await fireEvent.press(screen.getByText("Misi"));

    await waitFor(() => expect(app.getPathname()).toBe("/misi"));

    expect(screen.getByTestId("streak-chip")).toHaveTextContent(/2 hari$/);
    expect(screen.getByText("Mulai misi")).toBeTruthy();
    expect(screen.queryByText("Misi hari ini selesai")).toBeNull();
  },
  20000,
);
