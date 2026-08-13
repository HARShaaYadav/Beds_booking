/*
  Warnings:

  - A unique constraint covering the columns `[mrn]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CriticalityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "criticality" "CriticalityLevel" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "isolationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mrn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_mrn_key" ON "Patient"("mrn");
