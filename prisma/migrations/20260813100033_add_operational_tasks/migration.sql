-- Add operational task types. CleaningTask is already part of the existing schema.
CREATE TYPE "MaintenanceTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NursingTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "MaintenanceTaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NursingTask" (
    "id" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "patientId" TEXT,
    "assignedTo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "NursingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "NursingTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MaintenanceTask_bedId_idx" ON "MaintenanceTask"("bedId");
CREATE INDEX "MaintenanceTask_assignedTo_idx" ON "MaintenanceTask"("assignedTo");
CREATE INDEX "MaintenanceTask_status_idx" ON "MaintenanceTask"("status");
CREATE INDEX "MaintenanceTask_priority_idx" ON "MaintenanceTask"("priority");
CREATE INDEX "NursingTask_bedId_idx" ON "NursingTask"("bedId");
CREATE INDEX "NursingTask_patientId_idx" ON "NursingTask"("patientId");
CREATE INDEX "NursingTask_assignedTo_idx" ON "NursingTask"("assignedTo");
CREATE INDEX "NursingTask_status_idx" ON "NursingTask"("status");
CREATE INDEX "NursingTask_priority_idx" ON "NursingTask"("priority");
CREATE INDEX "NursingTask_dueAt_idx" ON "NursingTask"("dueAt");

ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NursingTask" ADD CONSTRAINT "NursingTask_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NursingTask" ADD CONSTRAINT "NursingTask_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NursingTask" ADD CONSTRAINT "NursingTask_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
