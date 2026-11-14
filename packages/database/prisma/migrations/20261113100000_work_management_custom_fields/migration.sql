-- Work management: custom fields on projects/tasks (schema was in Prisma but missing from SQL migrations)

ALTER TABLE "work_projects"
  ADD COLUMN IF NOT EXISTS "custom_field_defs" JSONB DEFAULT '[]'::jsonb;

ALTER TABLE "work_tasks"
  ADD COLUMN IF NOT EXISTS "custom_fields" JSONB DEFAULT '{}'::jsonb;
