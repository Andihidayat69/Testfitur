# Changelog

Versions follow `docs/decisions/0005-versioning.md`. Newest first.

## 0.2.0 (build 2), 2026-11-13

First tester build. All tier 1 features of the Next version, Android only (iOS not built or tested yet).

### What's in it

- **Onboarding:** welcome, Financial Habit Check (3 questions, 4 habit types), monthly jajan budget, optional payday reminder.
- **Beranda (Home):** jajan left this month with a mood (safe, low, over), "Tahan dulu" card, main saving goal, points, Profil (change the jajan budget and payday reminder).
- **Catat (Expense Tracker):** record expenses and income by category and date, edit and delete, monthly history with income, spending and difference.
- **Tahan dulu (Pause Before Buying):** item and price, impact on jajan left, one reflection question, wait or buy. Waiting earns points (up to 3 times a day) and can move the money to a saving goal; buying records the expense.
- **Tabung (Smart Saving):** saving goals with progress, deposits, a celebration when a goal is reached.
- **Pengingat gajian (Payday Reminder):** notification at 09:00 on payday and a pop-up to set money aside first.
- Data stays on the phone, in an encrypted database. No account, no internet needed.
- App icon, splash screen and notification icon with the Jajan Tenang logo.

### What testers should try

- Go through onboarding and check whether your habit type feels right.
- Record a few days of real-ish spending in Catat (please use made-up amounts if you prefer).
- Use "Tahan dulu" before a purchase you are considering, and try both "Tunda dulu" and "Tetap beli".
- Create a saving goal and move money into it after waiting on a purchase.
- Set a payday reminder for a date a few days away and see whether the notification and pop-up arrive.
- Report anything confusing with the version shown at the bottom of Profil.

### Known limits

- The Misi tab is a placeholder (tier 2).
- Data is lost if the app is uninstalled or the phone changes; there is no backup yet.
- The payday notification can arrive up to an hour after 09:00 (Android battery saving).
- Signed with a test key: install by sideloading; it cannot be published to the Play Store as is.
