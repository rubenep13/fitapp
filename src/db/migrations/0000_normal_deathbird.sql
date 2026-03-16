CREATE TABLE IF NOT EXISTS `exercise` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_day_id` text NOT NULL,
	`name` text NOT NULL,
	`target_sets` integer NOT NULL,
	`order` integer NOT NULL,
	FOREIGN KEY (`routine_day_id`) REFERENCES `routine_day`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `routine_day` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `session` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_day_id` text NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`duration_minutes` integer,
	FOREIGN KEY (`routine_day_id`) REFERENCES `routine_day`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `working_set` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`rpe` integer,
	`notes` text,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE no action
);
