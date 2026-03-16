import journal from "./meta/_journal.json";

const m0000 = `CREATE TABLE IF NOT EXISTS \`exercise\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`routine_day_id\` text NOT NULL,
	\`name\` text NOT NULL,
	\`target_sets\` integer NOT NULL,
	\`order\` integer NOT NULL,
	FOREIGN KEY (\`routine_day_id\`) REFERENCES \`routine_day\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`routine_day\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`order\` integer NOT NULL,
	\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`session\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`routine_day_id\` text NOT NULL,
	\`date\` text NOT NULL,
	\`notes\` text,
	\`duration_minutes\` integer,
	FOREIGN KEY (\`routine_day_id\`) REFERENCES \`routine_day\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`working_set\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`session_id\` text NOT NULL,
	\`exercise_id\` text NOT NULL,
	\`set_number\` integer NOT NULL,
	\`reps\` integer NOT NULL,
	\`weight_kg\` real NOT NULL,
	\`rpe\` integer,
	\`notes\` text,
	FOREIGN KEY (\`session_id\`) REFERENCES \`session\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`exercise_id\`) REFERENCES \`exercise\`(\`id\`) ON UPDATE no action ON DELETE no action
);`;

const m0001 = `CREATE TABLE \`dish\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`dish_ingredient\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`dish_id\` text NOT NULL,
	\`food_id\` text NOT NULL,
	\`grams\` real NOT NULL,
	FOREIGN KEY (\`dish_id\`) REFERENCES \`dish\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`food_id\`) REFERENCES \`food\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE \`food\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`calories_per_100g\` real NOT NULL,
	\`protein_per_100g\` real NOT NULL,
	\`carbs_per_100g\` real NOT NULL,
	\`fat_per_100g\` real NOT NULL,
	\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`meal_log\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`date\` text NOT NULL,
	\`meal_time\` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`meal_log_date_meal_time\` ON \`meal_log\` (\`date\`,\`meal_time\`);
--> statement-breakpoint
CREATE TABLE \`meal_log_entry\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`meal_log_id\` text NOT NULL,
	\`type\` text NOT NULL,
	\`dish_id\` text,
	\`food_id\` text,
	\`grams\` real,
	\`scale_factor\` real,
	FOREIGN KEY (\`meal_log_id\`) REFERENCES \`meal_log\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`dish_id\`) REFERENCES \`dish\`(\`id\`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (\`food_id\`) REFERENCES \`food\`(\`id\`) ON UPDATE no action ON DELETE no action
);`;

export default { journal, migrations: { m0000, m0001 } };
