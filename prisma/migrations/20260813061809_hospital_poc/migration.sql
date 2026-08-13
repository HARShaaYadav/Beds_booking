-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('GENERAL', 'ICU', 'EMERGENCY', 'PRIVATE', 'ISOLATION');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'LOCKED', 'BOOKED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('LOCKED', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "bedType" "BedType" NOT NULL,
    "ward" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "lockedById" TEXT,
    "lockedUntil" TIMESTAMP(3),
    "patientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "patientId" TEXT,
    "bookedById" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "lockExpiresAt" TIMESTAMP(3),
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admissionAt" TIMESTAMP(3),
    "dischargeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedStatusHistory" (
    "id" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "oldStatus" "BedStatus" NOT NULL,
    "newStatus" "BedStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BedStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Bed_hospitalId_idx" ON "Bed"("hospitalId");

-- CreateIndex
CREATE INDEX "Bed_status_idx" ON "Bed"("status");

-- CreateIndex
CREATE INDEX "Bed_bedType_idx" ON "Bed"("bedType");

-- CreateIndex
CREATE INDEX "Bed_lockedUntil_idx" ON "Bed"("lockedUntil");

-- CreateIndex
CREATE INDEX "Bed_patientId_idx" ON "Bed"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_hospitalId_bedNumber_key" ON "Bed"("hospitalId", "bedNumber");

-- CreateIndex
CREATE INDEX "Booking_bedId_idx" ON "Booking"("bedId");

-- CreateIndex
CREATE INDEX "Booking_patientId_idx" ON "Booking"("patientId");

-- CreateIndex
CREATE INDEX "Booking_bookedById_idx" ON "Booking"("bookedById");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "BedStatusHistory_bedId_idx" ON "BedStatusHistory"("bedId");

-- CreateIndex
CREATE INDEX "BedStatusHistory_createdAt_idx" ON "BedStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedStatusHistory" ADD CONSTRAINT "BedStatusHistory_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedStatusHistory" ADD CONSTRAINT "BedStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
