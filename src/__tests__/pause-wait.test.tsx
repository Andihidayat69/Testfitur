import { expect, test } from "@jest/globals";
import { fireEvent, screen, waitFor } from "expo-router/testing-library";

import { reflectionQuestions } from "../features/pause/pause";
import { launchApp, onboardedProfile } from "../test-utils/app";

test("waiting: validation, impact, question, celebration, points on Home; nothing recorded in Catat", async () => {
  const { app, pauseStore, entryStore } = await launchApp({ profile: onboardedProfile(800000) });
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.queryByTestId("points-chip")).toBeNull(); // hidden at 0 points

  await fireEvent.press(screen.getByText("Tahan dulu"));
  await waitFor(() => expect(app.getPathname()).toBe("/tahan"));
  expect(await screen.findByText("Langkah 1 dari 4")).toBeTruthy();

  await fireEvent.press(screen.getByText("Cek sisa jajan"));
  expect(screen.getByText("Isi nama barangnya dulu, ya.")).toBeTruthy();
  expect(screen.getByText("Isi harganya dulu, ya.")).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId("pause-item-input"), "Sepatu sneakers");
  await fireEvent.changeText(screen.getByTestId("pause-price-input"), "400000");
  await fireEvent.press(screen.getByText("Cek sisa jajan"));

  await waitFor(() => expect(app.getPathname()).toBe("/tahan/dampak"));
  expect(screen.getByText("Rp400.000")).toBeTruthy(); // 800.000 − 400.000
  expect(screen.getByText("Sekarang Rp800.000")).toBeTruthy();
  expect(screen.getByText("Masih aman sampai akhir bulan.")).toBeTruthy();
  expect(screen.getByTestId("mascot-berpikir")).toBeTruthy();

  await fireEvent.press(screen.getByText("Lanjut"));
  await waitFor(() => expect(app.getPathname()).toBe("/tahan/pikir"));
  const question = screen.getByTestId("reflection-question");
  expect(reflectionQuestions as readonly string[]).toContain(question.props.children);

  await fireEvent.press(screen.getByText("Tunda dulu"));
  await waitFor(() => expect(app.getPathname()).toBe("/tahan/hasil"));
  expect(screen.getByText("Keren, kamu tahan diri!")).toBeTruthy();
  expect(screen.getByText("Uang yang terselamatkan")).toBeTruthy();
  expect(screen.getByTestId("points-earned")).toHaveTextContent(/\+10 poin$/);

  const [saved] = await pauseStore.listAll();
  expect(saved).toMatchObject({ item: "Sepatu sneakers", price: 400000, category: "online_shopping", decision: "wait", points: 10, entryId: null });
  expect(await entryStore.listAll()).toHaveLength(0);

  await fireEvent.press(screen.getByText("Kembali ke beranda"));
  await waitFor(() => expect(app.getPathname()).toBe("/beranda"));
  expect(screen.getByTestId("points-chip")).toHaveTextContent(/(^|\D)10 poin$/);
  expect(screen.getByText("Rp800.000")).toBeTruthy(); // jajan left unchanged
});
