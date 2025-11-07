CREATE TABLE "farm" (
	"clerk_organiasation_id" text NOT NULL,
	"name" text,
	"creator_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "farm_clerk_organiasation_id_unique" UNIQUE("clerk_organiasation_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "farm" ADD CONSTRAINT "farm_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;