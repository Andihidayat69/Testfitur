CREATE TABLE `deposits` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`amount` integer NOT NULL,
	`occurred_on` text NOT NULL,
	`source` text NOT NULL,
	`pause_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pause_id`) REFERENCES `pauses`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "deposits_amount_positive" CHECK("deposits"."amount" > 0)
);
--> statement-breakpoint
CREATE INDEX `deposits_goal_id` ON `deposits` (`goal_id`);--> statement-breakpoint
CREATE INDEX `deposits_occurred_on` ON `deposits` (`occurred_on`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`target` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`reached_at` integer,
	CONSTRAINT "goals_target_positive" CHECK("goals"."target" > 0)
);
