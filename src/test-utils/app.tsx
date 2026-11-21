
// Test harness for whole-app tests: renders the real routes with an in-memory profile store
// instead of the encrypted SQLite database. Use made-up data only.
//
// expo-router keeps navigation state in module globals, so render the app once per test file
// (one file per scenario). A fresh file is also the closest match to a fresh app launch.
import { jest } from "@jest/globals";
import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

import { createInMemoryEntryStore, type EntryStore } from "@/db/entry-store";
import {
  createInMemoryMissionStore,
  type MissionStore,
} from "@/db/mission-store";
import { createInMemoryPauseStore, type PauseStore } from "@/db/pause-store";
import {
  createInMemoryProfileStore,
  type Profile,
  type ProfileStore,
} from "@/db/profile-store";
import { createInMemorySavingStore, type SavingStore } from "@/db/saving-store";
import type { Entry } from "@/features/expenses/entry";
import type { Mission } from "@/features/missions/missions";
import type { Pause } from "@/features/pause/pause";
import type { Deposit, SavingGoal } from "@/features/saving/goals";

let mockStore: ProfileStore = createInMemoryProfileStore();
let mockEntryStore: EntryStore = createInMemoryEntryStore();
let mockPauseStore: PauseStore = createInMemoryPauseStore(mockEntryStore);
let mockSavingStore: SavingStore = createInMemorySavingStore();
let mockMissionStore: MissionStore = createInMemoryMissionStore();
let mockFailSaves = false;

jest.mock("@/db/open", () => ({
  openAppStores: async () => ({
    profile: new Proxy({} as ProfileStore, {
      get:
        (_target, key: keyof ProfileStore) =>
        (...args: never[]) =>
          key === "completeOnboarding" && mockFailSaves
            ? Promise.reject(new Error("save failed"))
            : (mockStore[key] as (...a: never[]) => unknown)(...args),
    }),
    entries: {
      listAll: () => mockEntryStore.listAll(),
      add: (input: never) => mockEntryStore.add(input),
      update: (id: string, input: never) => mockEntryStore.update(id, input),
      remove: (id: string) => mockEntryStore.remove(id),
    },
    pauses: {
      listAll: () => mockPauseStore.listAll(),
      record: (input: never) =>
        mockFailSaves
          ? Promise.reject(new Error("save failed"))
          : mockPauseStore.record(input),
    },
    missions: {
      listAll: () => mockMissionStore.listAll(),
      complete: (input: never) =>
        mockFailSaves
          ? Promise.reject(new Error("save failed"))
          : mockMissionStore.complete(input),
    },
    saving: new Proxy({} as SavingStore, {
      get:
        (_target, key: keyof SavingStore) =>
        (...args: never[]) =>
          (mockSavingStore[key] as (...a: never[]) => unknown)(...args),
    }),
  }),
}));

export async function launchApp(
  options: {
    profile?: Profile | null;
    entries?: Entry[];
    pauses?: Pause[];
    goals?: SavingGoal[];
    deposits?: Deposit[];
    missions?: Mission[];
    failSaves?: boolean;
  } = {},
) {
  mockStore = createInMemoryProfileStore(options.profile ?? null);
  mockEntryStore = createInMemoryEntryStore(options.entries ?? []);
  mockPauseStore = createInMemoryPauseStore(
    mockEntryStore,
    options.pauses ?? [],
  );
  mockSavingStore = createInMemorySavingStore(
    options.goals ?? [],
    options.deposits ?? [],
  );
  mockMissionStore = createInMemoryMissionStore(options.missions ?? []);
  mockFailSaves = options.failSaves ?? false;

  const app = await renderRouter("./src/app", { initialUrl: "/" });

  return {
    app,
    store: mockStore,
    entryStore: mockEntryStore,
    pauseStore: mockPauseStore,
    savingStore: mockSavingStore,
    missionStore: mockMissionStore,
  };
}

/** A made-up onboarded profile. */
export function onboardedProfile(
  jajanBudget = 800000,
  over: Partial<Profile> = {},
): Profile {
  return {
    name: "Andi",
    habitType: "impulsive",
    jajanBudget,
    onboardingCompletedAt: new Date(2026, 0, 1),
    payday: null,
    paydayHandledFor: null,
    ...over,
  };
}

/** Selects an answer on the current question and continues. */
export async function answer(label: string) {
  await fireEvent.press(await screen.findByText(label));
  await fireEvent.press(screen.getByText("Lanjut"));
}

/** From welcome to the jajan budget step. */
export async function reachBudgetStep(
  answers: [string, string, string, string, string],
) {
  await fireEvent.press(await screen.findByText("Mulai"));

  for (const label of answers) {
    await answer(label);
  }

  await fireEvent.press(screen.getByText("Lanjut"));

  await screen.findByText("Berapa kuota jajanmu sebulan?");

  // Isi nama panggilan untuk kebutuhan pengujian.
  await fireEvent.changeText(
    screen.getByTestId("profile-name-input"),
    "Andi",
  );
}
