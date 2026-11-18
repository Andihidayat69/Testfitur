# Payday Reminder

- Status: implemented (2026-11-13)
- Tier: 1
- Product reference: `docs/product/product-definition.md` (Features: Payday Reminder; Core Loop: "Payday reminder → set aside Rp300.000 in Smart Saving")
- Depends on: `docs/specs/smart-saving.md` (the deposit flow), `docs/specs/home.md` (hosts the pop-up)

## Goal

Make "save first, on payday" happen: on the day the salary arrives, before the money starts disappearing, remind the user to set aside the amount they chose, and make doing it one tap away.

## User Stories

- As a user, I want to tell the app when I get paid and how much I want to set aside, so that it can remind me at the right moment.
- As a user, I want a notification on payday, so that I set money aside before I spend it.
- As a user who opens the app on payday, I want a friendly pop-up that takes me straight to recording the deposit, so that saving takes seconds.
- As a user, I want to change or turn off the reminder, so that it fits my life.

## Behavior

### Setting It Up

Two places, same form:

1. **End of onboarding (optional):** right after the jajan budget is saved, a step "Pengingat gajian" appears. It can be skipped with "Nanti saja"; onboarding is already complete either way, so skipping or closing the app here never sends the user back to welcome. (In the v0.1 prototype this step followed the jajan budget.)
2. **Profil:** a third row "Pengingat gajian" shows "Tgl 25 · Rp300.000" or "Belum diatur", with "Atur" / "Ubah".

The form:

- Title "Kapan kamu gajian?", body "Di hari itu, kami ingatkan kamu menyisihkan uang dulu."
- **Tanggal gajian**: chips "Tgl 1", "Tgl 5", "Tgl 10", "Tgl 15", "Tgl 25", "Tgl 28", plus "Tanggal lain" that opens a choice of 1–31. Required.
- **Sisihkan tiap gajian**: `MoneyInput`, required, Rp1.000 to Rp100.000.000, placeholder `300.000`.
- Primary button "Ingatkan aku". From Profil, an existing reminder also gets a secondary "Matikan pengingat".
- On "Ingatkan aku": ask for notification permission if it has not been asked yet (see Notifications), save, schedule, and continue (onboarding → Beranda; Profil → back with the toast "Pengingat gajian disimpan.").

### Payday

- The payday of a month is the chosen day, or the last day of the month when the month is shorter (for example day 31 in February → 28 or 29).
- **Notification** at 09:00 local time on payday:
  - Title: "Yeay, hari gajian!"
  - Body: "Sisihkan tabunganmu dulu sebelum kepakai, yuk."
  - No amounts or other financial data in the notification, because it can show on the lock screen.
  - Tapping it opens the app on Beranda with the pop-up.
- **Pop-up on Home** (design system: Reminder pop-up): shown when the app is opened on payday or in the 3 days after it, once per payday, until the user acts on it.
  - `cek-hp` mascot on top, title "Yeay, hari gajian!", body "Sisihkan <amount> dulu sebelum kepakai, yuk."
  - Primary "Sisihkan sekarang" → Add Deposit with the amount pre-filled and the main goal selected (no goals: create one first, as in Smart Saving). The deposit is a normal one (`source = manual`): it comes from salary, so it does not reduce jajan left.
  - "Nanti saja" closes it for this payday.
  - Either button marks this payday as handled; the pop-up does not come back until next month's payday.

### Notifications

- Permission is requested only when the user turns on the reminder, never at app start. On Android 13+ a never-asked permission reports "denied" with `canAskAgain = true`, so "refused" means `canAskAgain = false` (found on the emulator).
- The pop-up is a Modal, which floats above every screen, so it shows only while Beranda is the focused screen (found on the emulator).
- Denied permission: the reminder is still saved and the Home pop-up still works; the form shows "Notifikasi mati. Kamu tetap dapat pengingat saat buka aplikasi." with a link to the phone's settings.
- Scheduling: the next 3 paydays are scheduled as one-off local notifications (this handles short months), and topped up every time the app opens. Changing or turning off the reminder cancels them first.
- All scheduling is local (`expo-notifications`); nothing is sent to a server (decision 0002).
- Delivery is best effort: Android may deliver up to an hour after 09:00 (inexact alarm window), which is fine for a reminder.
- Known gap: the notification uses the default small icon; a monochrome app icon for notifications is still to be added.

## Stored Data

On the profile:

- `paydayDay`: 1–31, or empty when no reminder
- `paydaySaveAmount`: integer rupiah, or empty
- `paydayHandledFor`: the payday date (`YYYY-MM-DD`) last acted on in the pop-up, so it shows once per payday

Scheduled notification IDs are kept by the operating system and found again by a fixed identifier prefix; they are not stored.

## Edge Cases

- Day 29, 30 or 31 in a short month: fires on the last day of that month.
- The user turns on the reminder on payday after 09:00: no notification today, but the pop-up shows today.
- The phone's date or time zone changes: paydays are recomputed on the next app open.
- The app is not opened for months: only the most recent payday's pop-up can show (within its 3-day window); missed ones are not stacked.
- Reminder turned off: scheduled notifications are cancelled and the pop-up stops.

## Out of Scope

- Percentage of salary: it needs the salary, which the app does not ask for (amount only, as in the v0.1 prototype).
- Choosing the notification time (fixed at 09:00).
- Several paydays a month, weekly pay, or a payday that moves (for example "last working day").
- Automatic deposits or reading the salary from a bank.
- Other notifications (budget running low, missions, re-engagement).

## Definition of Done

- [x] Payday date for each month (including short months), the 3-day pop-up window, "handled" state and the next 3 scheduled dates covered by unit tests
- [x] Amount and day validation covered by unit tests
- [x] App tests: set up in onboarding and skip it; set up, change and turn off from Profil; pop-up on payday → "Sisihkan sekarang" → deposit (jajan left unchanged); "Nanti saja" hides it until next payday
- [x] Notification scheduling verified on the Android emulator (permission prompt, scheduled notification, tap opens the pop-up)
- [x] Schema, migration and `docs/architecture/data-model.md` updated
- [x] User-facing text is in Indonesian
- [x] Glossary updated (payday, payday reminder)
