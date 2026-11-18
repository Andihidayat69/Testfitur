CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`category` text,
	`note` text,
	`occurred_on` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "entries_amount_positive" CHECK("entries"."amount" > 0),
	CONSTRAINT "entries_category_matches_type" CHECK(("entries"."type" = 'expense' AND "entries"."category" IS NOT NULL) OR ("entries"."type" = 'income' AND "entries"."category" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `entries_occurred_on` ON `entries` (`occurred_on`);