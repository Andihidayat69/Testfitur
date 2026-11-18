# Glossary

Domain terms, what they mean, and the single name to use in code. Add a term the first time it appears in a spec.

| Term | Meaning | Name in code |
|---|---|---|
| jajan | Spending on snacks, treats and small personal wants, as opposed to needs | — |
| jajan budget | Monthly limit for jajan, set at the end of onboarding. On screen: "kuota jajan" | `jajanBudget` |
| habit type | Result of the Financial Habit Check: impulsive ("Si Gercep"), hard to save ("Si Nanti-Nanti"), not tracking ("Si Mengalir") or steady ("Si Tenang") | `habitType`: `impulsive`, `hard_to_save`, `not_tracking`, `steady` |
| jajan left | Jajan budget minus jajan spending minus money moved from jajan to saving (deposits from Pause Before Buying) in the current calendar month; can be negative. On screen: "sisa jajan" | `jajanLeft` (`jajanStatus().left`) |
| entry | One recorded expense or income in Expense Tracker. On screen: "catatan" | `Entry` |
| expense | Money spent, with a category. On screen: "pengeluaran" | `type: "expense"` |
| income | Money received, no category. On screen: "pemasukan" | `type: "income"` |
| expense category | One of six fixed categories: Makan & jajan, Transportasi, Belanja online, Hiburan, Tagihan, Lainnya | `food_snacks`, `transport`, `online_shopping`, `entertainment`, `bills`, `other` |
| jajan category | An expense category that counts against the jajan budget: Makan & jajan, Belanja online, Hiburan | `countsAsJajan` |
| main goal | The oldest saving goal that has not reached its target, shown on Home. On screen: "tujuan utama" | `mainGoal()` |
| saving goal | A named savings target with an amount, such as "Tiket konser". On screen: "tujuan" | `SavingGoal` (`goals` table) |
| deposit | Money the user records as set aside toward a saving goal; not an expense. On screen: "setoran" | `Deposit` (`source`: `manual` or `pause`) |
| reached | A goal whose deposits have reached its target. On screen: "Tercapai" | `reachedAt` |
| jajan moved to saving | Deposits made from Pause Before Buying ("Pindahkan ke tabungan"); they reduce jajan left in their month | `jajanMovedToSaving()` |
| pause | One Pause Before Buying decision: item, price, jajan category, reflection question, decision (`wait` or `buy`). On screen: "Tahan dulu" | `Pause` |
| money saved | The price of an item the user decided to wait on. On screen: "Uang yang terselamatkan" | `pause.price` where `decision = "wait"` |
| mission | The daily quiz task in Daily Habit Mission: 3 questions, one per day, worth 10 points when finished. On screen: "misi" | `Mission` (`missions` table) |
| mission level | 1–3, from missions completed (0–9, 10–24, 25+); picks the difficulty of questions | `level`, `levelFor()` |
| points | Reward earned by waiting in Pause Before Buying (10, at most 3 times a day) and by finishing a Daily Habit Mission (10, once a day); spent on mascot items (tier 3). On screen: "poin" | `points` (stored per pause; total = sum) |
| reflection question | The one question shown on step 3 of Pause Before Buying, picked at random | `question` (1–3), `reflectionQuestions` |
| streak | Consecutive days with a completed mission, ending today or yesterday (Habit Tracker may widen this). On screen: "hari" | `missionStreak()` |
| onboarding | Welcome, Financial Habit Check and jajan budget, shown until the jajan budget is saved | `onboarding`, `onboardingCompletedAt` |
| payday | The day of the month the user gets paid; in a shorter month, its last day. On screen: "hari gajian" | `paydayIn()`, `latestPayday()` |
| payday reminder | Notification at 09:00 on payday plus a Home pop-up (payday and the 3 days after) to set money aside first. On screen: "pengingat gajian" | `profile.payday` (`day`, `saveAmount`) |
| premium | Paid features, shown locked to free users | — |
