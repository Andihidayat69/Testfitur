CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`done_on` text NOT NULL,
	`level` integer NOT NULL,
	`question_ids` text NOT NULL,
	`correct` integer NOT NULL,
	`points` integer NOT NULL,
	`completed_at` integer NOT NULL,
	CONSTRAINT `missions_level_range` CHECK (`missions`.`level` BETWEEN 1 AND 3),
	CONSTRAINT `missions_correct_range` CHECK (`missions`.`correct` BETWEEN 0 AND 3),
	CONSTRAINT `missions_points_not_negative` CHECK (`missions`.`points` >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `missions_done_on_unique` ON `missions` (`done_on`);
