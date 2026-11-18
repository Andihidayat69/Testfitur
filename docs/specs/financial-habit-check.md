# Financial Habit Check

- Status: implemented (2026-11-12)
- Tier: 1
- Product reference: `docs/product/product-definition.md` (Features table: Financial Habit Check)
- Depends on: `docs/specs/ui-foundation.md`

## Goal

On first launch, help the user recognize their money habit in under a minute, without feeling judged, and end by setting the monthly jajan budget that Home and Pause Before Buying rely on.

## User Stories

- As a new user, I want a short, friendly quiz about my money habits, so that I learn which habit to work on first.
- As a new user, I want to set how much I allow myself for jajan each month, so that the app can tell me how much I have left.
- As a user who closed the app halfway, I want to start again cleanly, so that I am not stuck on a half-finished step.

## Behavior

The flow has four steps: welcome → three questions → result → jajan budget. Onboarding is complete only when the jajan budget is saved.

### 1. Welcome

- Hero with the `sapa` mascot (at least 240 px tall).
- Title: "Hai, aku teman jajanmu!"
- Body: "Jajan tetap jalan, tabungan tetap aman. Kenalan dulu sama kebiasaan uangmu, yuk."
- Primary button: "Mulai" → question 1.

### 2. Questions

- One question per screen, with a step header ("Pertanyaan 1 dari 3" and three step dots).
- Under the question: "Tenang, tidak ada jawaban salah."
- Answers are `ChipOption`s; selecting one highlights it. "Lanjut" stays disabled until an answer is selected.
- Back (header button or Android back) goes to the previous question with its answer still selected; back on question 1 returns to welcome.

Questions, answers and the habit each answer points to (from the v0.1 prototype; content may change after user testing):

| # | Question | Answer → habit signal |
|---|---|---|
| 1 | Pas gajian, uangmu biasanya… | Langsung kepakai semua → `hard_to_save`; Sebagian kusisihkan dulu → none; Tahu-tahu habis aja → `not_tracking` |
| 2 | Lihat promo, kamu biasanya… | Langsung checkout → `impulsive`; Masuk keranjang dulu → none; Ikut beli kalau teman beli → `impulsive` |
| 3 | Tahu uangmu ke mana bulan lalu? | Tahu, aku catat → none; Kira-kira tahu → `hard_to_save`; Nggak tahu sama sekali → `not_tracking` |

### 3. Result

Scoring: count the signals per habit type. The type with the most signals wins. Ties are broken in this order: `impulsive`, `hard_to_save`, `not_tracking`. With no signals at all, the result is `steady`.

| Habit type (code) | Shown name | Description |
|---|---|---|
| `impulsive` | Si Gercep | Promo gampang bikin kamu tergoda. Fitur Tahan Dulu bakal jadi teman terbaikmu. |
| `hard_to_save` | Si Nanti-Nanti | Niat nabung ada, tapi sering keduluan pengeluaran. Kita sisihkan di awal, yuk. |
| `not_tracking` | Si Mengalir | Uangmu jalan tanpa dicatat. Mulai dari catat jajan harian dulu, ya. |
| `steady` | Si Tenang | Kebiasaanmu sudah lumayan rapi. Kita jaga biar tetap konsisten. |

- Hero with the `juara` mascot, label "Tipe kebiasaanmu" and the type name as the big text; the description below.
- Primary button: "Lanjut" → jajan budget. No back button (the quiz is done).

### 4. Jajan Budget

- Step header with back to the result.
- Title: "Berapa kuota jajanmu sebulan?"
- Body: "Buat jajan, nongkrong, dan belanja kecil. Bisa diubah kapan saja."
- `MoneyInput` labeled "Kuota jajan bulanan", empty at first (no pre-filled amount, so the user is not anchored to one), placeholder `800.000`.
- Quick-pick chips: Rp500.000, Rp800.000, Rp1.000.000. Tapping one fills the input; typing a different amount unselects the chip.
- Primary button: "Simpan kuota".
  - Empty or zero: no save; the input shows "Isi kuota jajanmu dulu, ya."
  - Valid: save the habit type, the jajan budget and the completion time in one transaction, then open the main tabs (Beranda).

### Stored Data

One profile record on the device:

- `habitType`: one of the four codes above
- `jajanBudget`: integer rupiah
- `onboardingCompletedAt`: timestamp

Individual answers are not stored.

## Edge Cases

- The app is closed or killed before "Simpan kuota": nothing is saved, and the next launch starts again at welcome.
- The user goes back from the budget step to the result: the result stays the same (no re-scoring).
- Budget input: digits only; leading zeros are dropped; pasted text with dots or "Rp" keeps only the digits.
- Budget limits: minimum Rp1.000, maximum Rp100.000.000. Above the maximum, the input shows "Maksimal Rp100.000.000, ya."
- Saving fails (database error): stay on the budget step, keep the input, and show "Maaf, belum berhasil disimpan. Coba lagi, ya." with the `sedih` mascot (an app-side problem, per the design system).

## Out of Scope

- Payday Reminder setup (separate spec; in the v0.1 prototype it came right after the budget).
- Retaking the quiz or changing the habit type later.
- Changing the jajan budget later (comes with Home or settings).
- Mascot name (open question 5 in the product definition).
- Skipping the quiz: the quiz cannot be skipped (it is three taps).

## Definition of Done

- [x] Scoring covered by unit tests, including every tie and the `steady` case
- [x] Budget parsing and validation covered by unit tests
- [x] Flow covered by a component or end-to-end test: welcome → three answers → result → budget → tabs
- [x] Killing the app mid-flow restarts at welcome (test)
- [x] Profile saved in one transaction; schema and migration added; `docs/architecture/data-model.md` updated
- [x] User-facing text is in Indonesian
- [x] Glossary updated (habit type codes, `jajanBudget`, "kuota jajan" as the on-screen term)
