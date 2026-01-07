-- Ensure the join table exists with NOT NULL FKs and no duplicate (taskId, toolId)
CREATE TABLE IF NOT EXISTS "task_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid NOT NULL,
	"toolId" uuid NOT NULL
);
--> statement-breakpoint

-- Ensure uniqueness of (taskId, toolId)
CREATE UNIQUE INDEX IF NOT EXISTS "task_tools_taskId_toolId_unique_idx" ON public.task_tools ("taskId", "toolId");
--> statement-breakpoint

-- Drop any existing FK constraints (if migration is re-run against an older table)
ALTER TABLE IF EXISTS "task_tools" DROP CONSTRAINT IF EXISTS "task_tools_taskId_task_id_fk";
ALTER TABLE IF EXISTS "task_tools" DROP CONSTRAINT IF EXISTS "task_tools_toolId_tools_id_fk";
--> statement-breakpoint

-- Make sure columns are NOT NULL if table pre-existed with nullable columns
ALTER TABLE IF EXISTS "task_tools" ALTER COLUMN "taskId" SET NOT NULL;
ALTER TABLE IF EXISTS "task_tools" ALTER COLUMN "toolId" SET NOT NULL;
--> statement-breakpoint

-- Recreate FK constraints with cascade behavior to maintain referential integrity
ALTER TABLE "task_tools" ADD CONSTRAINT "task_tools_taskId_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "task_tools" ADD CONSTRAINT "task_tools_toolId_tools_id_fk" FOREIGN KEY ("toolId") REFERENCES "public"."tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;