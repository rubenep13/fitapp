CREATE TABLE `dish` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dish_ingredient` (
	`id` text PRIMARY KEY NOT NULL,
	`dish_id` text NOT NULL,
	`food_id` text NOT NULL,
	`grams` real NOT NULL,
	FOREIGN KEY (`dish_id`) REFERENCES `dish`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `food` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`calories_per_100g` real NOT NULL,
	`protein_per_100g` real NOT NULL,
	`carbs_per_100g` real NOT NULL,
	`fat_per_100g` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meal_log` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`meal_time` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meal_log_date_meal_time` ON `meal_log` (`date`,`meal_time`);--> statement-breakpoint
CREATE TABLE `meal_log_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_log_id` text NOT NULL,
	`type` text NOT NULL,
	`dish_id` text,
	`food_id` text,
	`grams` real,
	`scale_factor` real,
	FOREIGN KEY (`meal_log_id`) REFERENCES `meal_log`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dish_id`) REFERENCES `dish`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
