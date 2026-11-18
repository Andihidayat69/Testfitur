# Smart Saving

- Status: implemented (2026-11-13)
- Tier: 1
- Product reference: `docs/product/product-definition.md` (Features: Smart Saving)
- Depends on: `docs/specs/ui-foundation.md`
- Completes: `docs/specs/home.md` (main saving goal card), `docs/specs/pause-before-buying.md` ("Pindahkan ke tabungan")
- Used later by: Payday Reminder ("Sisihkan sekarang" opens a deposit)

## Goal

Give the money a user sets aside a name and a finish line ("Tiket konser", "Dana darurat"), so saving feels like progress toward something they want instead of money that just disappears.

## User Stories

- As a user, I want to create a saving goal with a name and a target, so that I know what I am saving for and how far I am.
- As a user, I want to record money I set aside toward a goal, so that I see my progress grow.
- As a user who just waited in Pause Before Buying, I want to move that money into a goal right away, so that the money I kept actually gets saved.
- As a user, I want to see my main goal on Home, so that I am reminded of it every day.
- As a user, I want to fix or remove a wrong deposit or a goal I no longer want, so that my numbers stay right.

## Behavior

The app records what the user says they set aside; it does not move real money (no bank or e-wallet connection).

### Tabung Tab

Top to bottom, at most three blocks below the hero:

1. **Hero** (Ice Blue): label "Total tabunganmu", the big number (sum of all deposits in all goals), caption "di N tujuan", mascot `menabung` (104 px).
2. **Primary button** "Catat setoran" → Add Deposit.
3. **Tujuanmu** card: each goal with its icon, name, percentage, "RpX dari RpY" and a progress bar; reached goals show a "Tercapai" badge (Butter Yellow) and sort after unfinished ones. Tapping a goal opens Goal Detail. At the bottom, a secondary button "Buat tujuan baru".

Empty state (no goals): the `menabung` mascot, "Belum ada tujuan tabungan. Buat yang pertama, yuk." and the primary button becomes "Buat tujuan baru".

### Create or Edit Goal

- **Nama tujuan**: required, up to 30 characters, placeholder "HP baru".
- **Target**: `MoneyInput`, required, Rp1.000 to Rp100.000.000, placeholder `4.000.000`.
- **Ikon**: one of eight line icons as chips (with accessible names): smartphone (Gadget), music (Konser), map (Liburan), gift (Hadiah), book (Belajar), shield (Dana darurat), home (Rumah), star (Lainnya). Default star.
- Button "Buat tujuan" (create) or "Simpan" (edit).
- Validation: "Isi nama tujuannya dulu, ya.", "Isi targetnya dulu, ya.", "Minimal Rp1.000, ya.", "Maksimal Rp100.000.000, ya."
- After creating: toast `Tujuan "<name>" dibuat.` and open Goal Detail.

### Goal Detail

- Hero: goal icon, name, big number = saved so far, caption "dari target RpY", progress bar, and a line: "Kurang RpZ lagi." or, when reached, "Tercapai! Keren banget." with the `tabungan-aman` mascot.
- Primary button "Catat setoran" (goal pre-selected).
- **Riwayat setoran**: deposits newest first (amount, day label). Tapping one opens Edit Deposit.
- Header actions: "Ubah" (Edit Goal) and "Hapus tujuan" (confirmation pop-up: "Hapus tujuan ini? Setorannya juga ikut terhapus." with "Hapus" / "Batal"). Deleting is allowed even with deposits; deposits from Pause that are deleted with the goal give their money back to jajan left.

### Add or Edit Deposit

- **Masuk ke tujuan**: `ChipOption` list of goals (unfinished first); pre-selected when opened from a goal, from Home's goal card, or from Pause (the main goal).
- **Nominal**: `MoneyInput`, required, Rp1 to Rp100.000.000, focused on open.
- **Tanggal**: "Hari ini" (default), "Kemarin", "Pilih tanggal" (same as Expense Tracker; no future dates).
- Button "Simpan setoran". Edit adds a secondary "Hapus setoran" with a confirmation pop-up.
- Validation: "Isi nominalnya dulu, ya.", "Maksimal Rp100.000.000, ya."
- No goals yet: Add Deposit opens Create Goal first ("Buat tujuan dulu, yuk."), then continues to the deposit.
- After saving:
  - Normal: toast "<amount> masuk ke <goal>." and return.
  - The deposit makes the goal reach its target for the first time: a celebration screen (`gembira` mascot, confetti that respects reduce-motion, "Tujuan tercapai!", "<goal> sudah terkumpul <target>.") with "Kembali".
- Deposits above the remaining amount are allowed; progress caps at 100% and the extra still counts in the total.

### Home: Main Saving Goal Card

Ships with this spec (Home spec, Delivery Order). Below the Pause card:

- The main goal is the oldest goal that has not reached its target.
- Card: label "Tujuan utama", icon, name, percentage, progress bar, "RpX dari RpY". Tapping it opens Goal Detail.
- No goals: the `menabung` mascot with "Belum ada tujuan tabungan. Buat yang pertama, yuk."; tapping opens Create Goal.
- All goals reached: the `tabungan-aman` mascot with "Semua tujuanmu tercapai. Keren!"; tapping opens the Tabung tab.

### Pause Before Buying: "Pindahkan ke tabungan"

Ships with this spec (Pause spec, Step 4a). On the "waited" screen, a primary button "Pindahkan ke tabungan" above "Kembali ke beranda" opens Add Deposit with the main goal selected and the amount pre-filled with the full price of the item waited on (it is the money kept; the v0.1 prototype pre-filled half), plus two hints under the amount: "Boleh ubah nominalnya." and "Diambil dari sisa jajanmu bulan ini." Saving returns to Home with the toast "<amount> pindah dari jajan ke tabungan. Keren!"

### Jajan Left and Deposits

Decided 2026-11-13. A deposit made from Pause Before Buying moves money that was jajan money, so it **reduces jajan left** for the month of the deposit; otherwise the same money would show both as saved and as still available for jajan.

- `jajanLeft = jajanBudget − jajanSpentThisMonth − jajanMovedToSavingThisMonth`, where the last term is the sum of this month's deposits that came from Pause (`source = pause`).
- Every other deposit (from the Tabung tab, from a goal, or later from the Payday Reminder) comes from income, not from the jajan budget, and does **not** change jajan left. This keeps "save first, on payday" separate from the jajan allowance.
- The source is fixed when the deposit is created. Editing its amount or date updates jajan left accordingly; deleting it gives the money back to jajan left.
- Wording stays celebratory, never punishing: the move is named on the deposit screen and in the toast, and Home's moods follow the same rules as before.

## Stored Data

**Saving goal**: `id` (UUID), `name`, `icon` (code), `target` (integer rupiah), `createdAt`, `updatedAt`, `reachedAt` (timestamp when deposits first reached the target; used for the one-time celebration and for sorting).

**Deposit**: `id` (UUID), `goalId` (deleting a goal deletes its deposits), `amount` (integer rupiah, > 0), `occurredOn` (local `YYYY-MM-DD`), `source` (`manual` or `pause`), `pauseId` (for `source = pause`: the pause it came from; also used by Progress Report later), `createdAt`, `updatedAt`.

Saved per goal = sum of its deposits. Deposits are not expenses: they never appear in Catat. Only deposits with `source = pause` reduce jajan left (see Jajan Left and Deposits).

## Edge Cases

- Editing a target below what is already saved: the goal becomes reached; no celebration (only deposits celebrate).
- Deleting or lowering deposits so a reached goal drops below its target: it becomes unfinished again (`reachedAt` cleared) and can celebrate again later.
- The main goal is deleted: Home shows the next oldest unfinished goal.
- Very long goal names are cut with an ellipsis in lists; full name on Goal Detail.

## Out of Scope

- Withdrawing or spending from a goal. A reached goal stays "Tercapai" and can be deleted when no longer needed.
- Choosing the source of a manual deposit (manual deposits are always treated as coming from income).
- Saving Challenge (tier 3; proposed as a mode inside Smart Saving later).
- Suggested target amount (premium).
- Automatic deposits, interest, or linking to bank accounts.
- Payday Reminder's pop-up (its own spec; it will open Add Deposit).

## Definition of Done

- [x] Saved per goal, total, progress, remaining, reached and main goal selection covered by unit tests (including over-target, edits that cross the target, and ties by creation time)
- [x] Jajan left with deposits covered by unit tests: a Pause deposit reduces it in its own month only; manual deposits never do; editing and deleting a Pause deposit update it
- [x] Goal and deposit validation covered by unit tests
- [x] App tests: create goal, deposit, reach target with celebration, edit and delete deposit, delete goal, Home goal card states, and "Pindahkan ke tabungan" from Pause
- [x] Schema, migration and `docs/architecture/data-model.md` updated
- [x] User-facing text is in Indonesian
- [x] Glossary updated (saving goal, deposit, main goal code name, reached)
