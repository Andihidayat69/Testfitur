import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import type { Pause } from "../features/pause/pause";
import { toLocalDate } from "../lib/dates";
import { launchApp, onboardedProfile } from "../test-utils/app";
import { makeEntry } from "../test-utils/entries";

test("a 4th wait today earns no points; deleting a bought expense keeps its pause and clears the link", async () => {
  const today = toLocalDate(new Date());
  const bought = makeEntry({ occurredOn: today, category: "online_shopping", amount: 120000, note: "Kaos" });
  const pause = (id: string, over: Partial<Pause> = {}): Pause => ({
    id,
    item: "Barang",
    price: 50000,
    category: "online_shopping",
    question: 1,
    decision: "wait",
    decidedOn: today,
    decidedAt: new Date(),
    entryId: null,
    points: 10,
    ...over,
  });
  const { app, pauseStore } = await launchApp({
    profile: onboardedProfile(800000),
    entries: [bought],
    pauses: [
      pause("w1"),
      pause("w2"),
      pause("w3"),
      pause("b1", { decision: "buy", points: 0, item: "Kaos", price: 120000, entryId: bought.id }),
    ],
  });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByTestId("points-chip")).toHaveTextContent(/(^|\D)30 poin$/);

  // 4th wait today: celebrated, logged, no points.
  await fireEvent.press(screen.getByText("Tahan dulu"));
  await fireEvent.changeText(await screen.findByTestId("pause-item-input"), "Jaket");
  await fireEvent.changeText(screen.getByTestId("pause-price-input"), "300000");
  await fireEvent.press(screen.getByText("Cek sisa jajan"));
  await fireEvent.press(await screen.findByText("Lanjut"));
  await fireEvent.press(await screen.findByText("Tunda dulu"));
  expect(await screen.findByText("Keren, kamu tahan diri!")).toBeTruthy();
  expect(screen.queryByTestId("points-earned")).toBeNull();
  expect((await pauseStore.listAll()).find((p) => p.item === "Jaket")).toMatchObject({ points: 0 });

  await fireEvent.press(screen.getByText("Kembali ke beranda"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByTestId("points-chip")).toHaveTextContent(/(^|\D)30 poin$/);

  // Delete the bought expense in Catat.
  await fireEvent.press(screen.getByText("Catat"));
  await fireEvent.press(await screen.findByLabelText(/^Kaos, Belanja online/));
  await fireEvent.press(await screen.findByText("Hapus catatan"));
  await fireEvent.press(screen.getByText("Hapus"));
  await waitFor(() => expect(app.getPathname()).toBe("/catat"));

  const b1 = (await pauseStore.listAll()).find((p) => p.id === "b1");
  expect(b1).toMatchObject({ decision: "buy", entryId: null });
});
