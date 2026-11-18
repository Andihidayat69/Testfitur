// Drizzle schema for the on-device database (decision 0003).
// Documented in docs/architecture/data-model.md; names follow docs/glossary.md.
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/** The single local user's profile. One row, id = 1. Written when onboarding completes. */
export const profile = sqliteTable(
  "profile",
  {
    id: integer("id").primaryKey(),
    habitType: text("habit_type", {
      enum: ["planner", "saver", "impulsive", "spontaneous", "balanced"],
    }).notNull(),
    /** Integer rupiah. */
    jajanBudget: integer("jajan_budget").notNull(),
    onboardingCompletedAt: integer("onboarding_completed_at", {
      mode: "timestamp_ms",
    }).notNull(),
    /** Payday Reminder (docs/specs/payday-reminder.md): day of month 1–31, empty when off. */
    paydayDay: integer("payday_day"),
    /** Integer rupiah to set aside on payday. */
    paydaySaveAmount: integer("payday_save_amount"),
    /** The payday (YYYY-MM-DD) whose pop-up was last acted on. */
    paydayHandledFor: text("payday_handled_for"),
  },
  (t) => [
    check("profile_single_row", sql`${t.id} = 1`),
    check("jajan_budget_positive", sql`${t.jajanBudget} > 0`),
  ],
);

/** Recorded expenses and income (docs/specs/expense-tracker.md). */
export const entries = sqliteTable(
  "entries",
  {
    id: text("id").primaryKey(), // UUID, unique without a server (decision 0002)
    type: text("type", { enum: ["expense", "income"] }).notNull(),
    /** Integer rupiah. */
    amount: integer("amount").notNull(),
    category: text("category", {
      enum: [
        "food_snacks",
        "transport",
        "online_shopping",
        "entertainment",
        "bills",
        "other",
      ],
    }),
    note: text("note"),
    /** Local calendar date, YYYY-MM-DD. */
    occurredOn: text("occurred_on").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("entries_occurred_on").on(t.occurredOn),
    check("entries_amount_positive", sql`${t.amount} > 0`),
    check(
      "entries_category_matches_type",
      sql`(${t.type} = 'expense' AND ${t.category} IS NOT NULL) OR (${t.type} = 'income' AND ${t.category} IS NULL)`,
    ),
  ],
);

/** Pause Before Buying decisions (docs/specs/pause-before-buying.md). */
export const pauses = sqliteTable(
  "pauses",
  {
    id: text("id").primaryKey(), // UUID
    item: text("item").notNull(),
    /** Integer rupiah. */
    price: integer("price").notNull(),
    category: text("category", {
      enum: ["food_snacks", "online_shopping", "entertainment"],
    }).notNull(),
    question: integer("question").notNull(),
    decision: text("decision", { enum: ["wait", "buy"] }).notNull(),
    /** Local calendar date, YYYY-MM-DD. */
    decidedOn: text("decided_on").notNull(),
    decidedAt: integer("decided_at", { mode: "timestamp_ms" }).notNull(),
    /** The expense recorded for "buy"; cleared if that expense is deleted. */
    entryId: text("entry_id").references(() => entries.id, {
      onDelete: "set null",
    }),
    points: integer("points").notNull(),
  },
  (t) => [
    index("pauses_decided_on").on(t.decidedOn),
    check("pauses_price_positive", sql`${t.price} > 0`),
    check("pauses_points_not_negative", sql`${t.points} >= 0`),
  ],
);

/** Saving goals (docs/specs/smart-saving.md). */
export const goals = sqliteTable(
  "goals",
  {
    id: text("id").primaryKey(), // UUID
    name: text("name").notNull(),
    icon: text("icon", {
      enum: [
        "smartphone",
        "music",
        "map",
        "gift",
        "book",
        "shield",
        "home",
        "star",
      ],
    }).notNull(),
    /** Integer rupiah. */
    target: integer("target").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    /** When deposits first reached the target; cleared if they drop below it. */
    reachedAt: integer("reached_at", { mode: "timestamp_ms" }),
  },
  (t) => [check("goals_target_positive", sql`${t.target} > 0`)],
);

/** Deposits toward saving goals. Not expenses; only `source = pause` reduces jajan left. */
export const deposits = sqliteTable(
  "deposits",
  {
    id: text("id").primaryKey(), // UUID
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    /** Integer rupiah. */
    amount: integer("amount").notNull(),
    /** Local calendar date, YYYY-MM-DD. */
    occurredOn: text("occurred_on").notNull(),
    source: text("source", { enum: ["manual", "pause"] }).notNull(),
    pauseId: text("pause_id").references(() => pauses.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("deposits_goal_id").on(t.goalId),
    index("deposits_occurred_on").on(t.occurredOn),
    check("deposits_amount_positive", sql`${t.amount} > 0`),
  ],
);

/** Completed daily missions, one per local day (docs/specs/daily-habit-mission.md). */
export const missions = sqliteTable(
  "missions",
  {
    id: text("id").primaryKey(), // UUID
    /** Local calendar date, YYYY-MM-DD. Unique: one mission per day. */
    doneOn: text("done_on").notNull().unique(),
    level: integer("level").notNull(),
    /** Comma-separated ids of the 3 questions, used for the 7-day no-repeat rule. */
    questionIds: text("question_ids").notNull(),
    correct: integer("correct").notNull(),
    points: integer("points").notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    check("missions_level_range", sql`${t.level} BETWEEN 1 AND 100`),
    check("missions_correct_range", sql`${t.correct} BETWEEN 0 AND 3`),
    check("missions_points_not_negative", sql`${t.points} >= 0`),
  ],
);
