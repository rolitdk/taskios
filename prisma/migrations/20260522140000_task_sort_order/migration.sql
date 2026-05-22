-- AlterTable
ALTER TABLE "Task" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill sortOrder per column (project + status), ordered by dueDate
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "projectId", status
      ORDER BY "dueDate" ASC, id ASC
    ) - 1 AS "sortOrder"
  FROM "Task"
)
UPDATE "Task" AS t
SET "sortOrder" = ranked."sortOrder"
FROM ranked
WHERE t.id = ranked.id;

-- CreateIndex
CREATE INDEX "Task_projectId_status_sortOrder_idx" ON "Task"("projectId", "status", "sortOrder");
