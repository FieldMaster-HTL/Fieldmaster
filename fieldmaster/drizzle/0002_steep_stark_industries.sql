ALTER TABLE "task" DROP CONSTRAINT "task_areaId_farm_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_areaId_area_id_fk" FOREIGN KEY ("areaId") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;