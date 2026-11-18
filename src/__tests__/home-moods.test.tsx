import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "expo-router/testing-library";

import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

// One launch per file (see test-utils/app.tsx). The other moods are covered in jajan-left.test.ts;
// this checks the screen wiring: jajan categories only, current month only, mood text and mascot.
describe("Home", () => {
  test("shows jajan left from jajan categories this month, with the low mood", async () => {
    const today = toLocalDate(new Date());
    const { app } = await launchApp({
      profile: onboardedProfile(800000),
      entries: [
        makeEntry({ occurredOn: today, category: "food_snacks", amount: 500000 }),
        makeEntry({ occurredOn: today, category: "online_shopping", amount: 150000 }),
        makeEntry({ occurredOn: today, category: "bills", amount: 1000000 }), // not jajan
        makeEntry({ occurredOn: today, type: "income", amount: 3000000 }),
        makeEntry({ occurredOn: "2000-01-15", category: "food_snacks", amount: 999000 }), // another month
      ],
    });
    await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
    expect(screen.getByText("Rp150.000")).toBeTruthy(); // 800.000 − 650.000
    expect(screen.getByText("dari kuota Rp800.000")).toBeTruthy();
    expect(screen.getByText("Jajanmu mulai menipis. Pelan-pelan, ya.")).toBeTruthy();
    expect(screen.getByTestId("mascot-semangat")).toBeTruthy();
  });
});
