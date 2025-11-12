ALTER TABLE "task" DROP CONSTRAINT "task_creator_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_area_id_farm_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "creatorId" uuid;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "dueTo" timestamp;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "areaId" uuid;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_areaId_farm_id_fk" FOREIGN KEY ("areaId") REFERENCES "public"."farm"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" DROP COLUMN "creator_id";--> statement-breakpoint
ALTER TABLE "task" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "task" DROP COLUMN "due_to";--> statement-breakpoint
ALTER TABLE "task" DROP COLUMN "area_id";