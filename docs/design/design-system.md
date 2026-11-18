# Design System

How the app looks, moves and speaks. What it does lives in `docs/product/product-definition.md`.

## Personality and Principles

Friendly, cheerful and calm: a friend who reminds you casually, not a stiff bank app or a judging teacher. The mascot and the money numbers are the focus; everything else stays quiet.

1. One screen, one primary action.
2. Money numbers are always large and easy to read.
3. Supportive, never judging. Waiting is celebrated; buying is not punished.
4. Premium is visible (locked) but never blocks free features.

## Screen Rules

- Each main screen has one **hero block** at the top: full Electric Blue or Ice Blue, bottom corners radius 32, holding the mascot and one big money number.
- The mascot appears large (min 96 px) on welcome, Home, Pause Before Buying, celebrations and pop-ups.
- Decoration: soft blob shapes behind heroes, large icons inside Baby Blue circles, Butter Yellow used like stickers (points, badges). No stock photos, heavy gradients or thick shadows.

## Keep Screens Light

The app must feel calm, not full. When in doubt, show less.

- **One job per screen.** If a screen both shows numbers and asks the user to decide, split it into two steps.
- **One big number per screen.** Secondary numbers (percentages, income, outflow, comparisons) go to a detail screen.
- **At most 3 content blocks** below the hero. No cards inside cards.
- **Never show the same information twice** on one screen, and never repeat bottom-navigation destinations as shortcuts.
- **Whitespace is welcome.** If content does not fit, cut content, not spacing.
- **Text fits its space.** Titles, labels and button text stay on one line; if they wrap, shorten the words.

## Colors

| Token | Name | Hex | Use |
|---|---|---|---|
| `primary` | Electric Blue | `#4385F5` | Primary buttons, active tab, progress, links |
| `secondary` | Sky Blue | `#78B8F5` | Supporting elements, icons, secondary charts |
| `accent` | Baby Blue | `#B9D9FF` | Selected chips, soft borders, inactive states |
| `bg-1` | Ice Blue | `#EAF3FF` | Section backgrounds |
| `bg-2` | Soft White | `#F7FAFF` | Main screen background |
| `highlight` | Butter Yellow | `#FFE28A` | Points, badges, Premium, celebrations only; never large backgrounds |
| `text` | Deep Navy | `#172B55` | All main text and dark icons |
| `danger-soft` | — | `#E5484D` | Budget running low; use sparingly (proposed) |
| `success` | — | `#3DBE8B` | Money saved, goal reached (proposed) |

Cards are white (`#FFFFFF`). Sky Blue and Baby Blue are never used for text.

## Typography

One family: **Plus Jakarta Sans** (fallback Inter). No serif anywhere.

| Style | Size / Weight | Use |
|---|---|---|
| Display number | 32–40 / ExtraBold | Big money numbers, tabular figures |
| Heading | 24 / Bold | Screen titles, celebrations |
| Title | 20 / SemiBold | Card titles, reflection questions |
| Body | 16 / Regular | Body text |
| Caption | 14 / Regular | Labels; nothing smaller than 14 |
| Button | 19 / Bold | Button labels (19, not 18, so white on Electric Blue meets WCAG AA for large text) |

Sentence case everywhere. Rupiah format: `Rp400.000` (dot thousands separator, no space).

## Layout and Shape

- Design frame 390 × 844 portrait; layouts must adapt to other Android and iOS screen sizes.
- Side margins 20 px; spacing on an 8 px scale; touch targets at least 48 × 48.
- Bottom navigation with 4 tabs: **Beranda, Catat, Tabung, Misi**. Profile and settings from the Home header.
- Radius 16 for cards and buttons, full pill for chips and progress bars.
- Shadows: Deep Navy at 8%, blur 16, y 4. Borders (1.5 px) only on interactive elements. Line icons, 2 px, rounded.

## Components

- **Button:** primary is Electric Blue, white label, height 52, full width; secondary is white with an Electric Blue border. Labels are specific verbs ("Tunda dulu", "Pindahkan ke tabungan"), never "Submit" or "OK".
- **Input:** label above, height 52, Baby Blue border, Electric Blue on focus, "Rp" prefix for amounts.
- **Chip option / quiz answer:** height 48, full width; selected is Baby Blue with an Electric Blue border; correct uses `success`, wrong uses `danger-soft` with a kind explanation.
- **Progress bar:** Ice Blue track, Electric Blue fill, height 8; turns `danger-soft` when the budget is nearly used up.
- **Premium badge:** Butter Yellow pill with padlock. Locked content is lightly blurred, not hidden.
- **Reminder pop-up:** floating white card with the mascot on top, short title, one sentence, primary action plus "Nanti saja"; backdrop Deep Navy 40%.
- **Streak and points:** Butter Yellow chip with a flame or star icon.

## Mascot

A chibi-style young man with dark wavy hair, wearing a Deep Navy hoodie with the Jajan Tenang logo on the chest. Soft cel shading, brown outlines, small gold accents (sparks, stars). Name is still open.

| Pose | Use it for |
|---|---|
| `sapa` (full body, holding a phone) | Welcome, onboarding, empty states with room for a tall image |
| `jempol` (thumbs up, chart) | Budget still safe, an action confirmed |
| `semangat` (fist raised) | Encouragement when the budget is running low or a goal is behind |
| `gembira` (cheering) | Celebrations: a purchase delayed, a goal reached |
| `juara` (crown, phone) | Habit Check result, achievements, streak milestones |
| `keren` (sunglasses) | Points or rewards unlocked |
| `berpikir` (hand on chin) | Pause Before Buying, reflection questions |
| `kaget` (hands on cheeks) | Budget nearly used up or exceeded; surprised, never blaming |
| `cek-hp` (holding a phone, surprised) | Reminders and notifications, including payday |
| `menabung` (hugging a piggy bank) | Smart Saving, deposits |
| `tabungan-aman` (speech bubble "Tabungan Aman!") | Deposit saved, saving goal on track |
| `sayang` (holding a heart) | Thanks, favorites, positive feedback |
| `fokus` (glasses, laptop) | Education content, features coming soon, loading |
| `ngantuk` (sleepy) | Re-engagement after the user has been inactive |
| `sedih` (crying) | App-side problems only (errors, failed sync). Never as a reaction to the user's spending |

- Show the character at 96 px tall or more; the full-body `sapa` needs at least 240 px.
- Motion: light float on idle, bounce for pop-ups, short confetti for celebrations.
- The current images are about 500–800 px tall. Higher-resolution originals are needed before release.

## Voice

User-facing text is casual, polite Indonesian, addressing the user as "kamu". Short sentences, active verbs, never blaming.

- Good: "Tenang, tidak ada jawaban salah." Avoid: "Kamu boros bulan ini."
- Empty states guide the next step: "Belum ada tujuan tabungan. Buat yang pertama, yuk."

## Accessibility

- Deep Navy text on Soft White, Ice Blue and white has strong contrast.
- Information never relies on color alone; warnings also use an icon or text.

## Open Issues

None. (Resolved 2026-11-12: white on Electric Blue is about 3.6:1, which WCAG AA allows only for large text, bold from 14 pt, about 18.7 px; button labels are therefore 19 px Bold.)
