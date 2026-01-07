CREATE TABLE "task_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid,
	"toolId" uuid
);
--> statement-breakpoint
ALTER TABLE "task_tools" ADD CONSTRAINT "task_tools_taskId_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_tools" ADD CONSTRAINT "task_tools_toolId_tools_id_fk" FOREIGN KEY ("toolId") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;