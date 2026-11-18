# Data Model

The data the app stores: entities, their fields, and how they relate. Entity and field names must match `docs/glossary.md`.

User financial data is sensitive; see Hard Rules in `CLAUDE.md`.

All data lives in one SQLite database on the device (`jajantenang.db`), encrypted with SQLCipher (decision 0003). The schema is defined in `src/db/schema.ts`; migrations are generated into `src/db/migrations/` with `npm run db:generate` and run on app start.

Conventions:

- Money is an integer number of rupiah (no decimals).
- Timestamps are stored as integer milliseconds since the Unix epoch (`timestamp_ms`).
- Column names are snake_case in SQL and camelCase in code.

## Entities

### Profile

The single local user. Exactly one row (`id = 1`), written when onboarding completes. Its presence means onboarding is complete. Spec: `docs/specs/financial-habit-check.md`.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | integer, primary key | Always 1 (check constraint) |
| `habitType` | `habit_type` | text, not null | `impulsive`, `hard_to_save`, `not_tracking` or `steady` |
| `jajanBudget` | `jajan_budget` | integer, not null | Monthly jajan budget in rupiah; > 0 (check constraint); the app allows Rp1.000 to Rp100.000.000 |
| `onboardingCompletedAt` | `onboarding_completed_at` | integer (ms), not null | When the jajan budget was saved |
| `paydayDay` | `payday_day` | integer | Payday Reminder: day of month 1–31; empty when the reminder is off. Spec: `docs/specs/payday-reminder.md` |
| `paydaySaveAmount` | `payday_save_amount` | integer | Rupiah to set aside on payday; empty when off |
| `paydayHandledFor` | `payday_handled_for` | text | The payday (`YYYY-MM-DD`) whose pop-up was last acted on, so it shows once per payday |

Quiz answers are not stored. Scheduled payday notifications live in the operating system, found by the identifier prefix `payday-`; they are not stored.

### Entries

Recorded expenses and income, one row per entry. Spec: `docs/specs/expense-tracker.md`.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | text, primary key | UUID, unique without a server (decision 0002) |
| `type` | `type` | text, not null | `expense` or `income` |
| `amount` | `amount` | integer, not null | Rupiah; > 0 (check constraint); the app allows up to Rp100.000.000 |
| `category` | `category` | text | Expense category code (`food_snacks`, `transport`, `online_shopping`, `entertainment`, `bills`, `other`); required for expenses, empty for income (check constraint) |
| `note` | `note` | text | Optional, up to 40 characters, trimmed |
| `occurredOn` | `occurred_on` | text, not null | Local calendar date `YYYY-MM-DD` (indexed). Month filters compare this, so an entry stays on the day the user picked even if the time zone changes |
| `createdAt` | `created_at` | integer (ms), not null | |
| `updatedAt` | `updated_at` | integer (ms), not null | |

Whether a category counts against the jajan budget (Makan & jajan, Belanja online, Hiburan) is defined in code (`src/features/expenses/categories.ts`), not stored.

The app loads all entries into memory on start (personal-scale data) and computes monthly summaries there.

### Pauses

One row per Pause Before Buying decision. Spec: `docs/specs/pause-before-buying.md`.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | text, primary key | UUID |
| `item` | `item` | text, not null | Up to 40 characters, trimmed |
| `price` | `price` | integer, not null | Rupiah; > 0 (check constraint) |
| `category` | `category` | text, not null | A jajan category: `food_snacks`, `online_shopping` or `entertainment` |
| `question` | `question` | integer, not null | Reflection question shown, 1–3 |
| `decision` | `decision` | text, not null | `wait` or `buy` |
| `decidedOn` | `decided_on` | text, not null | Local calendar date `YYYY-MM-DD` (indexed); used for the daily points limit |
| `decidedAt` | `decided_at` | integer (ms), not null | |
| `entryId` | `entry_id` | text | For `buy`: the expense recorded in `entries`. Foreign key, `ON DELETE SET NULL`, so deleting the expense keeps the pause |
| `points` | `points` | integer, not null | Points this decision earned (10 or 0); ≥ 0 (check constraint) |

A "buy" writes the pause and its expense in one transaction. The points total is the sum of `points` over all pauses.

### Goals

Saving goals. Spec: `docs/specs/smart-saving.md`.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | text, primary key | UUID |
| `name` | `name` | text, not null | Up to 30 characters, trimmed |
| `icon` | `icon` | text, not null | `smartphone`, `music`, `map`, `gift`, `book`, `shield`, `home` or `star` |
| `target` | `target` | integer, not null | Rupiah; > 0 (check constraint); the app allows Rp1.000 to Rp100.000.000 |
| `createdAt` | `created_at` | integer (ms), not null | Orders goals; the main goal is the oldest unfinished one |
| `updatedAt` | `updated_at` | integer (ms), not null | |
| `reachedAt` | `reached_at` | integer (ms) | Set when deposits first reach the target (one-time celebration); cleared if they drop below it. Updated in the same transaction as the deposit change |

### Deposits

Money recorded as set aside toward a goal. Not expenses.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | text, primary key | UUID |
| `goalId` | `goal_id` | text, not null | Foreign key to `goals.id`, `ON DELETE CASCADE` (indexed) |
| `amount` | `amount` | integer, not null | Rupiah; > 0 (check constraint) |
| `occurredOn` | `occurred_on` | text, not null | Local calendar date `YYYY-MM-DD` (indexed) |
| `source` | `source` | text, not null | `manual` or `pause`. Only `pause` deposits reduce jajan left, in their own month |
| `pauseId` | `pause_id` | text | For `source = pause`: the pause it came from. Foreign key, `ON DELETE SET NULL` |
| `createdAt` | `created_at` | integer (ms), not null | |
| `updatedAt` | `updated_at` | integer (ms), not null | |

Saved per goal = sum of its deposits.

### Missions

One row per completed Daily Habit Mission. Spec: `docs/specs/daily-habit-mission.md`.

| Field (code) | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | text, primary key | UUID |
| `doneOn` | `done_on` | text, not null, unique | Local calendar date `YYYY-MM-DD`; one mission per day (unique constraint) |
| `level` | `level` | integer, not null | 1–3 when the mission was done (check constraint) |
| `questionIds` | `question_ids` | text, not null | Comma-separated ids of the 3 questions; used for the 7-day no-repeat rule |
| `correct` | `correct` | integer, not null | Right answers, 0–3 (check constraint) |
| `points` | `points` | integer, not null | 10; ≥ 0 (check constraint) |
| `completedAt` | `completed_at` | integer (ms), not null | |

Individual answers are not stored. Questions live in the app code, not in the database. The points total is the sum of `points` over all pauses plus over all missions.

## Relations

Foreign keys are enforced (`PRAGMA foreign_keys = ON` when the database opens).

- `pauses.entry_id` → `entries.id` (optional, on delete set null).
- `deposits.goal_id` → `goals.id` (required, on delete cascade).
- `deposits.pause_id` → `pauses.id` (optional, on delete set null).
