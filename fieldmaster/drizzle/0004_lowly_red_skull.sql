ALTER TABLE "task_tools" DROP CONSTRAINT "task_tools_taskId_task_id_fk";
--> statement-breakpoint
ALTER TABLE "task_tools" DROP CONSTRAINT "task_tools_toolId_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "task_tools" ALTER COLUMN "taskId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_tools" ALTER COLUMN "toolId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_tools" ADD CONSTRAINT "task_tools_taskId_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task_tools" ADD CONSTRAINT "task_tools_toolId_tools_id_fk" FOREIGN KEY ("toolId") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "task_tools_taskId_toolId_unique" ON "task_tools" USING btree ("taskId","toolId");--> statement-breakpoint
CREATE INDEX "task_tools_task_id_idx" ON "task_tools" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "task_tools_tool_id_idx" ON "task_tools" USING btree ("toolId");