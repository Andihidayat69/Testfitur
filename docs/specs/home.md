# Home

- Status: implemented (2026-11-13)
- Tier: 1
- Product reference: `docs/product/product-definition.md` (Features: "Tier 1 also includes … the Home screen")
- Depends on: `docs/specs/ui-foundation.md`, `docs/specs/financial-habit-check.md` (jajan budget)
- Related: `docs/specs/expense-tracker.md`, `docs/specs/pause-before-buying.md`, `docs/specs/smart-saving.md`, `docs/specs/payday-reminder.md`

## Goal

Answer one question the moment the user opens the app: "How much jajan do I have left this month?", and offer the one action that protects it: pausing before a purchase.

## User Stories

- As a user, I want to see how much jajan money I have left this month, so that I know whether I can treat myself.
- As a user, I want a calm, non-judging signal when my jajan budget runs low or runs out, so that I adjust without feeling guilty.
- As a user about to buy something, I want a one-tap way into Pause Before Buying, so that I check before I spend.
- As a user, I want to see my main saving goal's progress, so that I remember what I am saving for.
- As a user, I want to change my jajan budget later, so that it matches my real life (onboarding promised "Bisa diubah kapan saja").

## Behavior

### Layout

Beranda tab, top to bottom. At most three blocks below the hero (design system).

1. **Header:** the Jajan Tenang logo (horizontal, color) on the left; a profile button on the right (line icon, 48 × 48 touch target, label "Profil").
2. **Hero** (Ice Blue): mood line, "Sisa jajan bulan ini", the big number, "dari kuota RpX" caption, mascot, progress bar.
3. **Pause card:** title "Mau beli sesuatu?", body "Tahan dulu, cek sisa jajanmu.", primary button "Tahan dulu" → Pause Before Buying.
4. **Main saving goal card:** label "Tujuan utama", goal name, progress bar, "RpX dari RpY". Tapping it opens the Tabung tab.

### Jajan Left

- `jajanLeft = jajanBudget − jajanSpentThisMonth − jajanMovedToSavingThisMonth`. The last term is the sum of this month's deposits made from Pause Before Buying ("Pindahkan ke tabungan"); it is 0 until Smart Saving ships. See `docs/specs/smart-saving.md`, Jajan Left and Deposits.
- `jajanSpentThisMonth` = the sum of expenses recorded in the jajan categories: Makan & jajan, Belanja online and Hiburan. Transportasi, Tagihan and Lainnya are recorded in Expense Tracker but do not reduce jajan left. (The v0.1 prototype counted every expense.) whose date falls in the current calendar month (1st to last day), in the phone's time zone. Calendar month rather than payday to payday, because the payday is optional and not set during onboarding.
- The big number shows `jajanLeft`; negative values show as `−Rp25.000`.
- The progress bar shows the share of the budget already spent (clamped to 0–100%).

### Mood

| State | Condition | Mood line | Mascot | Big number and bar |
|---|---|---|---|---|
| Safe | `jajanLeft` ≥ 20% of the budget | "Jajanmu masih aman!" | `jempol` | Deep Navy; bar Electric Blue |
| Low | 0 ≤ `jajanLeft` < 20% of the budget | "Jajanmu mulai menipis. Pelan-pelan, ya." | `semangat` | Deep Navy; bar `danger-soft` |
| Over | `jajanLeft` < 0 | "Kuota jajanmu sudah lewat. Tenang, bulan depan mulai lagi." | `kaget` | `danger-soft`; bar full `danger-soft` |

The mood line carries the meaning in words, so the state never relies on color alone. The copy never blames the user (design system: Voice).

### Main Saving Goal

- The main goal is the oldest saving goal that has not reached its target. (Pinning a goal is not offered; it would add UI.)
- No saving goals: the card shows the `menabung` mascot (96 px) with "Belum ada tujuan tabungan. Buat yang pertama, yuk." and opens the Tabung tab.
- All goals reached: the card shows the `tabungan-aman` mascot with "Semua tujuanmu tercapai. Keren!" and opens the Tabung tab.

### Profile and Jajan Budget

- The profile button opens a **Profil** screen (stack, back to Beranda) with two rows:
  - "Tipe kebiasaanmu": the habit type's shown name (read-only).
  - "Kuota jajan bulanan": the current budget with an "Ubah kuota" button.
- "Ubah kuota" opens the same budget step used in onboarding (input, quick-pick chips, limits, error texts), pre-filled with the current budget, with the button "Simpan kuota". Saving returns to Profil with the toast "Kuota jajan diperbarui."; Home shows the new numbers immediately.
- Changing the budget changes this month's `jajanLeft` right away (no history of past budgets is kept; see Out of Scope).

### Payday Pop-Up

Home hosts the payday reminder pop-up, but its trigger and content belong to the Payday Reminder spec.

### Delivery Order

Home's blocks depend on features that are not built yet. Each block ships with the feature it needs; until then it is not shown:

| Block | Ships with |
|---|---|
| Header, hero, Profil and budget editing | This spec (spending is 0 until Expense Tracker exists, so `jajanLeft` = budget) |
| Pause card | Pause Before Buying |
| Main saving goal card | Smart Saving |
| Payday pop-up | Payday Reminder |

## Edge Cases

- Month rollover while the app is open: the hero recalculates when Home comes back into focus.
- Expenses dated in the future or in past months do not count toward this month.
- Very large values (for example `−Rp12.345.678`) stay on one line; the display number steps down in size.
- Budget edited below what is already spent this month: the hero switches to the Over state immediately.

## Out of Scope

- Streak chip in the header (comes with Habit Tracker). The points chip is defined in `docs/specs/pause-before-buying.md`.
- Budget history per month and rolling over unspent budget.
- Notifications about the budget running low.
- Any other profile or settings items (name, theme, data export).

## Definition of Done

- [x] `jajanLeft`, spent share and mood state covered by unit tests (safe, low at the 20% boundary, zero left, over)
- [x] Calendar-month filter covered by unit tests (first and last day of the month, time zone, future and past expenses)
- [x] Home renders each mood with the right mascot and text (component test)
- [x] Editing the budget from Profil updates Home (app test)
- [x] User-facing text is in Indonesian
- [x] Glossary updated (`jajanLeft`, "sisa jajan", main goal)
