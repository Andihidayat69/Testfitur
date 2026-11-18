# Pause Before Buying

- Status: implemented (2026-11-13)
- Tier: 1 (signature flow)
- Product reference: `docs/product/product-definition.md` (Features: Pause Before Buying)
- Depends on: `docs/specs/home.md` (jajan left, Pause card), `docs/specs/expense-tracker.md` (a "buy" records an expense)
- Related: `docs/specs/smart-saving.md` ("Pindahkan ke tabungan")

## Goal

Put a short, friendly pause between "I want this" and "I bought it": show what the purchase does to this month's jajan, ask one honest question, and let the user decide. Waiting is celebrated; buying is never punished.

## User Stories

- As a user about to buy something, I want to see how much jajan I would have left if I bought it, so that I decide with the number in front of me.
- As a user, I want one simple question to think about, so that I notice whether I need it or just want it.
- As a user who decides to wait, I want to feel good about it and see the money I kept, so that waiting becomes a habit.
- As a user who decides to buy, I want it recorded for me, so that I do not have to enter it again in Catat.

## Behavior

Entry point: the Pause card on Home ("Mau beli sesuatu?" / "Tahan dulu"), which ships with this feature (Home spec, Delivery Order).

Four steps, each with a step header "Langkah N dari 4" and step dots. One job per screen.

### Step 1: What and How Much

- Title "Mau beli apa?", body "Tulis barang dan harganya. Kita lihat dulu dampaknya."
- **Nama barang**: required text, up to 40 characters, placeholder "Sepatu sneakers".
- **Harga**: `MoneyInput`, required, Rp1 to Rp100.000.000, placeholder `400.000`.
- **Kategori**: chips for the three jajan categories only (Makan & jajan, Belanja online, Hiburan); default Belanja online (the v0.1 prototype always used Belanja online).
- Button "Cek sisa jajan".
- Validation: empty name → "Isi nama barangnya dulu, ya."; empty or zero price → "Isi harganya dulu, ya."; above the maximum → "Maksimal Rp100.000.000, ya."
- Back returns to Home and discards the pause.

### Step 2: The Impact

- `after = jajanLeft − price` (jajan left as defined in the Home spec, current month).
- Hero: mascot, label "Sisa jajanmu kalau beli <item>", the big number `after`, caption "Sekarang <jajanLeft>".
- A one-line note with an icon (never color alone):

| Condition | Note | Mascot |
|---|---|---|
| `after` ≥ 20% of the budget | "Masih aman sampai akhir bulan." | `berpikir` |
| 0 ≤ `after` < 20% of the budget | "Tinggal sedikit sampai akhir bulan." | `kaget` |
| `after` < 0 | "Sisa jajanmu nggak cukup buat ini." | `kaget` |

- Button "Lanjut". Back returns to step 1 with the inputs kept.

### Step 3: Think and Decide

- Hero: `berpikir` mascot, "<item> · <price>", and one reflection question as the title.
- Body: "Tenang, nggak ada jawaban salah. Pilih yang paling jujur, ya."
- Two buttons: primary "Tunda dulu", secondary "Tetap beli". Waiting is the primary action on purpose.
- The question is picked at random when the pause starts and stays the same if the user goes back and forth. Questions (from the v0.1 prototype):
  1. "Butuh sekarang, atau cuma pengin?"
  2. "Besok kamu masih mau ini?"
  3. "Kalau batal, uangnya buat apa?"
- Back returns to step 2.

### Step 4a: Waited

- Hero with the `gembira` mascot and a short confetti burst (respects reduce-motion), title "Keren, kamu tahan diri!".
- Label "Uang yang terselamatkan" and the big number = price.
- Points chip (Butter Yellow): "+10 poin" when this wait earned points; hidden when it did not (see Points).
- Buttons: primary "Pindahkan ke tabungan" (opens a deposit; see `docs/specs/smart-saving.md`) and secondary "Kembali ke beranda".

### Step 4b: Bought

- Hero with the `jempol` mascot, title "Oke, sudah dicatat".
- Body "Selamat menikmati <item>!"
- Label "Sisa jajanmu sekarang" and the big number (jajan left after this expense; `danger-soft` if negative).
- Button "Kembali ke beranda".
- An expense is recorded through Expense Tracker: amount = price, category = the chosen one, note = item name, date = today. It appears in Catat and can be edited or deleted there like any other entry.

Step 4 has no back button; Android back goes to Home. The decision is final; a wrong "buy" is fixed by editing or deleting the expense in Catat.

### Logging

Every decision is saved as a pause record when the user taps "Tunda dulu" or "Tetap beli" (product definition: "Every decision is logged"). Leaving before step 3's decision saves nothing.

### Points

- Waiting earns 10 points, for at most 3 waits per day (by `decidedOn`), so tapping "Tunda dulu" repeatedly does not farm points. Later waits that day are still celebrated and logged, with 0 points. Buying earns none (and costs none).
- The user's points total is shown as a Butter Yellow chip ("★ 10 poin") in the Home header, next to the profile button, once the total is above 0. This replaces the Home spec's "points chip comes with Pause Before Buying" note.
- Spending points (mascot items) is tier 3 and out of scope.

## Stored Data

One record per decision:

- `id`: UUID
- `item`: text, up to 40 characters, trimmed
- `price`: integer rupiah
- `category`: one of the three jajan category codes
- `question`: which reflection question was shown (1–3)
- `decision`: `wait` or `buy`
- `decidedOn`: local calendar date (`YYYY-MM-DD`); `decidedAt`: timestamp
- `entryId`: for `buy`, the expense recorded in Expense Tracker (cleared if that expense is deleted later)
- `points`: points earned by this decision (10 or 0), so the total stays correct if the rule changes later

Points total = the sum of `points` over all pause records (other sources, such as missions, add to it later).

## Edge Cases

- Budget 0 left or already over before starting: step 2 shows a negative `after` with the "nggak cukup" note; the user can still choose either option.
- The app is closed during steps 1–3: nothing is saved; next time Home opens normally.
- Saving the decision fails: stay on step 3, show "Maaf, belum berhasil disimpan. Coba lagi, ya." with the `sedih` mascot; nothing is half-saved (the pause record and the expense are written in one transaction).
- The bought expense is later deleted in Catat: the pause record stays (the decision happened), its `entryId` is cleared, and Home's jajan left goes back up.
- Month rollover between step 1 and the decision: numbers use the date when the decision is made.

## Out of Scope

- Reminders to revisit a waited item, or a list of waited items.
- Buy-or-wait advice (premium; product definition open question 3).
- Spending points, streaks.
- Totals of money saved and delayed or cancelled purchases (Progress Report, tier 2).

## Definition of Done

- [x] `after`, the three impact notes and their 20% boundary covered by unit tests
- [x] Points rule covered by unit tests (wait, buy, and the daily limit of 3)
- [x] Wait flow and buy flow covered by app tests: pause record saved, expense recorded for "buy", Home jajan left and points chip updated
- [x] Deleting a bought expense clears `entryId` and keeps the pause record (test)
- [x] Schema, migration and `docs/architecture/data-model.md` updated
- [x] User-facing text is in Indonesian
- [x] Glossary updated (pause, money saved, points, reflection question)
