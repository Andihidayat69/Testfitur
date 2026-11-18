CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`habit_type` text NOT NULL,
	`jajan_budget` integer NOT NULL,
	`onboarding_completed_at` integer NOT NULL,
	CONSTRAINT "profile_single_row" CHECK("profile"."id" = 1),
	CONSTRAINT "jajan_budget_positive" CHECK("profile"."jajan_budget" > 0)
);
