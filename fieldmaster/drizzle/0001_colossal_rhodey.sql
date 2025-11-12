CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"creator_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"due_to" timestamp,
	"area_id" uuid
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_area_id_farm_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."farm"("id") ON DELETE no action ON UPDATE no action;