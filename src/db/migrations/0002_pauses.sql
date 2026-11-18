CREATE TABLE `pauses` (
	`id` text PRIMARY KEY NOT NULL,
	`item` text NOT NULL,
	`price` integer NOT NULL,
	`category` text NOT NULL,
	`question` integer NOT NULL,
	`decision` text NOT NULL,
	`decided_on` text NOT NULL,
	`decided_at` integer NOT NULL,
	`entry_id` text,
	`points` integer NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "pauses_price_positive" CHECK("pauses"."price" > 0),
	CONSTRAINT "pauses_points_not_negative" CHECK("pauses"."points" >= 0)
);
--> statement-breakpoint
CREATE INDEX `pauses_decided_on` ON `pauses` (`decided_on`);