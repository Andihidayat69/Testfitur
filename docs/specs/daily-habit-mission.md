# Daily Habit Mission

- Status: approved 2026-11-17, in implementation (not yet tested on a device)
- Tier: 2
- Product reference: `docs/product/product-definition.md` (Features: Daily Habit Mission)
- Depends on: `docs/specs/pause-before-buying.md` (points), `docs/specs/ui-foundation.md` (tabs, hero, components)
- Related: Habit Tracker (tier 2, next spec) reads the missions done per day

## Goal

Give the user one short, friendly money-awareness task each day, so that opening the app becomes a small daily habit. Missions never judge: there are no failing grades, only learning and points.

## User Stories

- As a user, I want one short mission a day, so that I learn something about money in under a minute.
- As a user, I want kind feedback when I pick a different answer, so that I learn without feeling judged.
- As a user, I want points and a streak for finishing missions, so that I stay motivated to come back.

## Behavior

The Misi tab (today a "coming soon" placeholder) becomes the home of this feature.

### Misi tab

- Hero: mascot, Butter Yellow chips for streak (bolt icon, "3 hari") and total points (star icon, "40 poin"). Chips are hidden when the value is 0.
- One content block: today's mission card.
  - Not done: title "Misi hari ini", caption "3 pertanyaan singkat · +10 poin", primary button "Mulai misi". Mascot `fokus`.
  - Done: title "Misi hari ini selesai", caption "Besok ada misi baru, ya.", no button. Mascot `gembira`.
- Nothing else on the screen (design system: at most 3 blocks, one job per screen).

### Mission flow (`/misi-harian`, a stack screen above the tabs)

A mission is **3 questions**. Each question screen has a step header "Pertanyaan N dari 3", the question as title, and 3 answer options (full-width quiz answer components).

1. The user taps an answer. The options lock.
2. Feedback shows at once under the options: correct → `success` color + check icon + "Betul!"; other answer → `danger-soft` + info icon + "Hampir!" The correct option is also marked. Both show the same short explanation. Tone: "Tenang, nggak ada jawaban salah buat belajar." Never "Salah".
3. Button "Lanjut" (last question: "Lihat hasil").

Back asks for confirmation ("Keluar dari misi? Progresmu tidak disimpan.") and leaves without saving anything.

### Result

- Mascot `juara` when 3/3, otherwise `jempol`, with a short confetti burst (respects reduce-motion).
- Title "Misi selesai!", big number "3/3 betul" (the one big number on the screen).
- Chip "+10 poin" (Butter Yellow).
- Button "Kembali ke misi".
- The mission is saved when the user taps "Lihat hasil" on the last question, not at each answer. The result screen shows once saving succeeded.

### Questions and level

- Questions are bundled in the app (`src/features/missions/questions.ts`), written in Indonesian. No network.
- Each question has a level 1–3. The user's level comes from missions completed: **0–9 → level 1, 10–24 → level 2, 25+ → level 3** (proposed thresholds).
- A mission picks 3 random questions of the user's level that were not shown in the last 7 days; if fewer than 3 remain, it falls back to any question of that level, then any level.
- The 3 chosen questions are fixed for the day (derived from the date), so leaving and coming back shows the same questions.

### Points and streak

- Finishing a mission earns **10 points**, once per day, whatever the score. Learning is rewarded, not only correctness.
- Total points = points from pauses + points from missions. `totalPoints()` changes to include missions; the Home chip uses the new total.
- Streak = consecutive local days with a completed mission, ending today or yesterday (so it is not lost before today's mission is done). Habit Tracker may widen the definition later.

## Stored Data

New table `missions`, one row per completed daily mission.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | text, primary key | UUID |
| `doneOn` | `done_on` | text, not null, unique | Local date `YYYY-MM-DD`; one mission per day (unique constraint) |
| `level` | `level` | integer, not null | 1–3 at the time |
| `questionIds` | `question_ids` | text, not null | Comma-separated ids of the 3 questions (used for the 7-day no-repeat rule) |
| `correct` | `correct` | integer, not null | 0–3 |
| `points` | `points` | integer, not null | 10; ≥ 0 (check constraint) |
| `completedAt` | `completed_at` | integer (ms), not null | |

Needs a Drizzle migration (`npm run db:generate`), a `MissionStore` interface with an in-memory test version, and an update to `docs/architecture/data-model.md`. Per-question answers are not stored.

## Edge Cases

- Midnight passes while the user is in a mission: the mission is saved under the date it started; the next day shows a new mission.
- The app is closed mid-mission: nothing is saved; the same 3 questions return next time that day.
- Two taps on the last button: saving is idempotent thanks to the unique `done_on`.
- Saving fails: friendly toast "Misinya belum tersimpan. Coba lagi, ya." and the user stays on the last question; "Lihat hasil" can be tapped again.
- Device clock changed backwards: a day that already has a mission shows as done; no second mission and no extra points.
- Question bank too small for the level: fallback rule above; the bank must hold at least 9 questions per level so this stays rare.

## Out of Scope

- Spending points on mascot items (tier 3), leaderboards, missions with friends.
- Notifications reminding the user to do the mission (separate spec).
- Habit Tracker checklist and calendar (next spec); Progress Report.
- Fetching questions from a server.

## Definition of Done

- [ ] Pure logic tested: level from completed count, question picking (no repeat, fallback, stable per date), streak, points total
- [ ] Whole-app tests: start mission, answer right and wrong, leave with confirmation, finish and see points on Home, tab shows "done" state
- [ ] Migration tested against the previous schema; data model doc updated
- [ ] User-facing text is in Indonesian, tone matches `docs/design/design-system.md`
- [ ] Glossary updated: mission, level, streak
- [ ] `npm test`, `npm run typecheck`, `npm run lint` pass; changelog entry for the next build

## Open Questions

1. Question content: the first bank (27 questions) was drafted by the AI agent and still needs a human review for accuracy and tone (product definition, open question 4).
2. Level thresholds (10 and 25 missions) are a proposal.
3. Should a perfect score give a small bonus later (for example +5)? Proposed: no, to keep it simple.

## Sample Questions (format)

Fields: `id`, `level`, `text`, `correct`, `wrong` (exactly 2), `explanation`. The 3 options are shuffled when a mission is built. The full bank (9 questions per level) is in `src/features/missions/questions.ts`.

| Level | Question | Correct answer | Explanation |
|---|---|---|---|
| 1 | Kapan waktu terbaik menyisihkan tabungan? | Di awal, begitu gajian masuk | Menabung duluan membuat tabungan tidak ikut terpakai. Sisanya baru untuk jajan. |
| 1 | Mana yang termasuk kebutuhan? | Bayar listrik | Kebutuhan itu hal yang harus ada. Jajan dan tren termasuk keinginan, dan itu boleh, asal ada batasnya. |
| 1 | Cara paling mudah tahu uang pergi ke mana? | Mencatat pengeluaran | Yang dicatat jadi kelihatan. Dari situ kamu bisa atur pelan-pelan. |
| 2 | Ada promo "diskon 50%" untuk barang yang tidak kamu rencanakan. Langkah paling aman? | Tunggu sehari, lalu putuskan | Diskon sering bikin buru-buru. Setelah sehari, biasanya kelihatan butuh atau cuma pengin. |
| 2 | Dana darurat sebaiknya disimpan untuk apa? | Kejadian tak terduga, bukan belanja | Dana darurat dipakai saat ada hal mendesak, misalnya sakit atau motor rusak. |
| 3 | Gaji Rp3.000.000. Pembagian 50/30/20: berapa untuk tabungan? | Rp600.000 | 20% dari Rp3.000.000 = Rp600.000. Angkanya boleh kamu sesuaikan dengan kondisimu. |
