# Product Definition

- Status: draft, revised 2026-11-05
- Source of truth for what the product is and what each version includes. Change it in this repo, in the same change as any code that depends on it.

## Summary

Jajan Tenang is a mobile habit companion for personal finance, for Android and iOS. It helps Gen Z hold off on impulsive buying, save first instead of last, and stay consistent, without taking away the joy of spending. It is not just a money log: it walks users through small daily actions until they become habits, with an animated mascot as their saving buddy.

## Users and Problems

Gen Z aged 18–29 with their own income, active e-wallet users who like snacking, online shopping and trends, and want to save but cannot stay consistent.

| Problem | Habit we want instead |
|---|---|
| Impulsive buying driven by promos and trends | Pause and weigh needs before buying |
| Spending most of the salary right away | Set money aside first, on payday |
| Not tracking spending | Record and review spending regularly |
| Losing motivation | Keep small positive habits going |

## Versions

| Version | Focus | Where |
|---|---|---|
| v0.1 | Clickable UI prototype with dummy data, to validate the core flow and interest in premium | Built in Google Stitch, not in this repo |
| Next | Working app with real data storage, tier 1 and tier 2 features | **This repo** |
| Later | Premium features, scan bill, full character animation, measuring real habit change | — |

The order after v0.1 is a proposal and will be set from v0.1 test results.

## Features

Grouped by habit stage. Tier sets build order: 1 = must have, 2 = next, 3 = minimal or deferred.

| Stage | Feature | What it does | Premium part | Tier |
|---|---|---|---|---|
| Awareness | Financial Habit Check | Onboarding quiz that identifies the user's money habit type (impulsive, hard to save, not tracking), then sets the monthly jajan budget | — | 1 |
| Awareness | Expense Tracker | Record income and spending by category; monthly summary and largest category | Scan bill, spending evaluation | 1 |
| Action | Payday Reminder | User sets payday and an amount or percentage to save; a notification on payday prompts setting money aside first | — | 1 |
| Action | Smart Saving | Named goals ("Tiket konser", "Dana darurat") with a user-set target; record deposits; show progress | Suggested target amount | 1 |
| Action | Pause Before Buying | **Signature flow.** Enter item and price, see the budget left if bought, answer a reflection question, decide to buy or wait. Waiting shows money saved, gives points, and offers moving it to savings. Every decision is logged. | Buy-or-wait advice | 1 |
| Action | Saving Challenge | Daily saving challenge with user-chosen amount and duration | — | 3 |
| Motivation | Daily Habit Mission | Short quiz-style missions that build money awareness, graded by user level | — | 2 |
| Motivation | Reward & Achievement | Points for missions and streaks; points unlock mascot items | — | 3 (item shop) |
| Monitoring | Habit Tracker | Daily checklist (save, record, mission) and a consistency calendar | — | 2 |
| Monitoring | Progress Report | Total saved and how often purchases were delayed or cancelled | Spending trend charts | 2 |

Tier 1 also includes the welcome screen with the mascot and the Home screen. Premium parts appear locked (padlock + "Premium" label), not hidden, plus one premium offer screen (tier 2).

## Core Loop

Recognize the habit (Habit Check, tracking) → act (Payday Reminder, Smart Saving, Pause Before Buying) → stay motivated (missions, points) → monitor (Habit Tracker, Progress Report) → repeat monthly.

Example: salary Rp3.000.000, goal Rp300.000 a month. Payday reminder → set aside Rp300.000 in Smart Saving → daily missions and delayed purchases earn points → month-end review → adjust the target.

## Out of Scope

- Never in the product: Saving Battle, leaderboards, saving challenges with friends.
- Not planned: Split Bill (dropped on 2026-11-05).
- Later version: premium features, real scan bill processing, full character animation.
- Not planned yet: connection to real bank accounts or e-wallets.

## Success Metrics

Measurable only in a working app, so they apply from the Next version:

- Users set money aside on target, consistently
- Spending is recorded and reviewed more often
- Fewer self-reported impulsive purchases
- More missions completed
- Habits hold week over week and month over month

## Open Questions

Items marked *proposed* are the working answer until confirmed.

1. Saving Challenge: *proposed* as a mode inside Smart Saving, not a separate feature.
2. ~~Expense categories~~ Decided 2026-11-12: Makan & jajan, Transportasi, Belanja online, Hiburan, Tagihan, Lainnya. Only Makan & jajan, Belanja online and Hiburan count against the jajan budget (`docs/specs/home.md`).
3. Premium: subscription form, price, and the free vs premium line. Are premium locks and the offer screen part of the Next version?
4. Mission content: source and number of questions (5 sample questions in v0.1).
5. Mascot name. Look and expressions are set in `docs/design/design-system.md`.
6. Distribution: Play Store and App Store, or test builds only (TestFlight, APK)?
7. Success metrics: the Next version is local-first and sends no usage data (decision 0002). How are the metrics above measured (for example, interviews or self-report from test users)?
8. Backup: user data is lost on uninstall or phone change. Is export or backup needed in the Next version (decision 0002)?
