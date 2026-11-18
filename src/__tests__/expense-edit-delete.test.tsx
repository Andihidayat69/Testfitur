import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { addDays, toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

test("editing moves an expense out of jajan; deleting asks first and removes it", async () => {
  const today = toLocalDate(new Date());
  const { app, entryStore } = await launchApp({
    profile: onboardedProfile(800000),
    entries: [
      makeEntry({ occurredOn: today, category: "food_snacks", amount: 100000, note: "Martabak" }),
      makeEntry({ occurredOn: today, category: "transport", amount: 20000, note: "Ojek" }),
    ],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByText("Rp700.000")).toBeTruthy();

  await fireEvent.press(screen.getByText("Catat"));
  await fireEvent.press(await screen.findByLabelText(/^Martabak, Makan & jajan/));
  await waitFor(() => expect(app.getPathname()).toMatch(/^\/catatan\//));
  expect(screen.getByTestId("entry-amount-input").props.value).toBe("100.000");

  // Move it to Tagihan and to yesterday.
  await fireEvent.press(screen.getByText("Tagihan"));
  await fireEvent.press(screen.getByText("Kemarin"));
  await fireEvent.press(screen.getByText("Simpan"));
  await waitFor(() => expect(app.getPathname()).toBe("/catat"));
  expect(screen.getByText("Tercatat.")).toBeTruthy();
  const edited = (await entryStore.listAll()).find((e) => e.note === "Martabak");
  expect(edited).toMatchObject({ category: "bills", occurredOn: addDays(today, -1) });

  // Delete Ojek: cancel first, then confirm.
  await fireEvent.press(screen.getByLabelText(/^Ojek, Transportasi/));
  await fireEvent.press(await screen.findByText("Hapus catatan"));
  expect(screen.getByText("Hapus catatan ini?")).toBeTruthy();
  await fireEvent.press(screen.getByText("Batal"));
  expect((await entryStore.listAll()).some((e) => e.note === "Ojek")).toBe(true);

  await fireEvent.press(screen.getByText("Hapus catatan"));
  await fireEvent.press(screen.getByText("Hapus"));
  await waitFor(() => expect(app.getPathname()).toBe("/catat"));
  expect(screen.getByText("Catatan dihapus.")).toBeTruthy();
  expect((await entryStore.listAll()).some((e) => e.note === "Ojek")).toBe(false);

  await fireEvent.press(screen.getByText("Beranda"));
  expect(await screen.findByText("Rp800.000")).toBeTruthy(); // nothing left in jajan categories
});
