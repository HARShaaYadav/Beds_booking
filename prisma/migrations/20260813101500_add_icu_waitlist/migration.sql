CREATE TYPE "ICUWaitlistStatus" AS ENUM ('WAITING', 'NOTIFIED', 'FULFILLED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "NotificationType" AS ENUM ('ICU_BED_AVAILABLE');

CREATE TABLE "ICUWaitlistEntry" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "clinicalUrgency" INTEGER NOT NULL,
    "requiresVentilator" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "priorityScore" INTEGER NOT NULL,
    "status" "ICUWaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "notifiedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ICUWaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "waitlistEntryId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ICUWaitlistEntry_status_priorityScore_createdAt_idx" ON "ICUWaitlistEntry"("status", "priorityScore" DESC, "createdAt");
CREATE INDEX "ICUWaitlistEntry_patientId_idx" ON "ICUWaitlistEntry"("patientId");
CREATE INDEX "ICUWaitlistEntry_requestedById_idx" ON "ICUWaitlistEntry"("requestedById");
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX "Notification_waitlistEntryId_idx" ON "Notification"("waitlistEntryId");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

ALTER TABLE "ICUWaitlistEntry" ADD CONSTRAINT "ICUWaitlistEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ICUWaitlistEntry" ADD CONSTRAINT "ICUWaitlistEntry_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_waitlistEntryId_fkey" FOREIGN KEY ("waitlistEntryId") REFERENCES "ICUWaitlistEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
