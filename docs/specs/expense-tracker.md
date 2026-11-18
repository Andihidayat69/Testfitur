# Expense Tracker

- Status: implemented (2026-11-13)
- Tier: 1
- Product reference: `docs/product/product-definition.md` (Features: Expense Tracker)
- Depends on: `docs/specs/ui-foundation.md`
- Used by: `docs/specs/home.md` (jajan spent this month); later Pause Before Buying ("buy" records an expense) and Progress Report

## Goal

Make recording spending so quick that it becomes a habit (a few seconds per entry), and show where the money went this month without making the user feel judged.

## User Stories

- As a user, I want to record what I just spent in a few taps, so that recording does not feel like a chore.
- As a user, I want to record an expense I forgot yesterday, so that my month stays complete.
- As a user, I want to see how much I spent this month and which category is the biggest, so that I know where my money goes.
- As a user, I want to fix or delete a wrong entry, so that my numbers stay right.
- As a user, I want to record income too, so that I can compare what came in with what went out. Income has no categories and appears only in History and the Terakhir list, never in the Catat hero.

## Behavior

### Categories

A fixed list (decided 2026-11-12, product definition open question 2). Users cannot add categories in this version.

| Shown name | Code | Counts against jajan budget | Icon (line) |
|---|---|---|---|
| Makan & jajan | `food_snacks` | yes | coffee |
| Transportasi | `transport` | no | navigation |
| Belanja online | `online_shopping` | yes | shopping-bag |
| Hiburan | `entertainment` | yes | film |
| Tagihan | `bills` | no | file-text |
| Lainnya | `other` | no | more-horizontal |

### Catat Tab

Top to bottom, at most three blocks below the hero:

1. **Hero** (Ice Blue): label "Pengeluaran bulan ini", the big number (all expense categories, current calendar month), caption "Paling banyak: <category>" (largest category this month), mascot `jempol` (96 px).
2. **Primary button** "Catat pengeluaran" → Add Entry.
3. **Per kategori** card: the top 3 categories this month with amount and a share bar (share of this month's spending). "Lihat semua" → History.
4. **Terakhir** card: the 3 most recent entries (expenses and income) with note, category, relative day ("Hari ini", "Kemarin", or "12 Nov") and amount (`−Rp25.000` for expenses, `+Rp3.000.000` in `success` for income). Tapping an entry opens Edit Entry. "Lihat semua" → History.

Empty month: the hero shows `Rp0` and no caption; instead of the two cards, the `fokus` mascot with "Belum ada catatan bulan ini. Catat jajan pertamamu, yuk."

### Add Entry

A stack screen with a step header ("Catat") and these fields, top to bottom:

- **Type** switch: "Pengeluaran" (default) | "Pemasukan".
- **Nominal**: `MoneyInput`, required, Rp1 to Rp100.000.000. Focused when the screen opens, so the number keyboard is up right away.
- **Kategori** (expenses only): `Chip`s for the six categories; default Makan & jajan.
- **Untuk apa?**: optional (to keep recording fast; the v0.1 prototype required it) text, up to 40 characters, placeholder "Kopi susu" (income: "Gaji"). If left empty, the list shows the category name (income: "Pemasukan").
- **Tanggal**: chips "Hari ini" (default) and "Kemarin", plus "Pilih tanggal" which opens the platform date picker. Any past date can be chosen (no limit); future dates cannot.
- Primary button "Simpan".

Validation: empty or zero amount → "Isi nominalnya dulu, ya."; above the maximum → "Maksimal Rp100.000.000, ya."

On save: return to the Catat tab and show a short confirmation (toast, 3 seconds):

- Expense in a jajan category: "Tercatat. Sisa jajanmu <jajanLeft>." (for example "Tercatat. Sisa jajanmu Rp320.000."). If jajan left is now negative: "Tercatat. Kuota jajanmu sudah lewat, tenang aja."
- Other expense or income: "Tercatat."

Home's jajan left updates immediately.

### Edit Entry

Same form, filled in, title "Ubah catatan", button "Simpan". A secondary button "Hapus catatan" asks for confirmation in an in-app pop-up ("Hapus catatan ini?" with "Hapus" and "Batal"); after deleting, return to where the user came from with the toast "Catatan dihapus."

### History

A stack screen opened from "Lihat semua":

- Month switcher at the top: "< November 2026 >"; the next arrow is disabled on the current month. No months before the first entry.
- Summary (detail screen, so secondary numbers are allowed here): Pengeluaran (big number), Pemasukan and Selisih (income minus spending) below it.
- Per kategori: all categories with spending that month, largest first, with amount and share bar.
- Entries grouped by day, newest first, each tappable to edit.

## Stored Data

One record per entry:

- `id`: unique without a server (UUID), per decision 0002
- `type`: `expense` or `income`
- `amount`: integer rupiah, > 0
- `category`: one of the six codes for expenses; empty for income
- `note`: optional text, up to 40 characters
- `occurredOn`: the local calendar date (`YYYY-MM-DD`), so an entry stays on the day the user picked even if the phone's time zone changes
- `createdAt`, `updatedAt`: timestamps

Month filters (this spec and Home) compare `occurredOn` with the current local calendar month.

## Edge Cases

- Many entries on one day: the list scrolls; the Catat tab still shows only the top 3 and the latest 3.
- An entry edited from a jajan category to a non-jajan one (or its date moved to another month) updates Home's jajan left.
- Two categories tie for "Paling banyak": the one that comes first in the category table wins.
- Note with only spaces is treated as empty; leading and trailing spaces are trimmed.
- The date picker on a phone set to a future date by mistake: "today" is whatever the phone says; entries are never rejected for that.

## Out of Scope

- Scan bill and spending evaluation (premium; whether locked premium items appear at all is product definition open question 3).
- Custom categories, budgets per category, recurring entries.
- Search and export.
- Recording an expense from Pause Before Buying (that spec will call this feature's store).

## Definition of Done

- [x] Month filtering, category totals, largest category, jajan spent and income/spending difference covered by unit tests
- [x] Amount and note validation covered by unit tests
- [x] Add, edit and delete flows covered by app tests, including the jajan-left toast and Home updating
- [x] Schema, migration and `docs/architecture/data-model.md` updated
- [x] User-facing text is in Indonesian
- [x] Glossary updated (expense, income, category codes, jajan category, entry)
