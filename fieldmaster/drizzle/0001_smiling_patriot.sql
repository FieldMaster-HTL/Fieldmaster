ALTER TABLE "task" RENAME COLUMN "creator_id" TO "creatorId";--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "due_to" TO "dueTo";--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "area_id" TO "areaId";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_creator_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_area_id_area_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_areaId_farm_id_fk" FOREIGN KEY ("areaId") REFERENCES "public"."farm"("id") ON DELETE no action ON UPDATE no action;