
CREATE TABLE `missions_new` (
  `id` text PRIMARY KEY NOT NULL,
  `done_on` text NOT NULL,
  `level` integer NOT NULL,
  `question_ids` text NOT NULL,
  `correct` integer NOT NULL,
  `points` integer NOT NULL,
  `completed_at` integer NOT NULL,
  CONSTRAINT `missions_level_range`
    CHECK (`level` BETWEEN 1 AND 100),
  CONSTRAINT `missions_correct_range`
    CHECK (`correct` BETWEEN 0 AND 3),
  CONSTRAINT `missions_points_not_negative`
    CHECK (`points` >= 0)
);
--> statement-breakpoint

INSERT INTO `missions_new` (
  `id`,
  `done_on`,
  `level`,
  `question_ids`,
  `correct`,
  `points`,
  `completed_at`
)
SELECT
  `id`,
  `done_on`,
  `level`,
  `question_ids`,
  `correct`,
  `points`,
  `completed_at`
FROM `missions`;
--> statement-breakpoint

DROP TABLE `missions`;
--> statement-breakpoint

ALTER TABLE `missions_new` RENAME TO `missions`;
--> statement-breakpoint

CREATE UNIQUE INDEX `missions_done_on_unique`
ON `missions` (`done_on`);


--> statement-breakpoint

UPDATE `profile`
SET `habit_type` = CASE `habit_type`
  WHEN 'hard_to_save' THEN 'saver'
  WHEN 'not_tracking' THEN 'spontaneous'
  WHEN 'steady' THEN 'balanced'
  ELSE `habit_type`
END;
