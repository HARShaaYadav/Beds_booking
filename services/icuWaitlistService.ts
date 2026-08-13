import { BedStatus, BedType, ICUWaitlistStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { emitIcuBedAvailable } from '@/lib/socket';

interface AddToIcuWaitlistInput {
  patientId: string;
  requestedById: string;
  clinicalUrgency: number;
  requiresVentilator?: boolean;
  notes?: string;
}

export class ICUWaitlistService {
  calculatePriorityScore(clinicalUrgency: number, requiresVentilator: boolean): number {
    // Clinical urgency is the primary ordering; ventilator need breaks close ties.
    return clinicalUrgency * 100 + (requiresVentilator ? 50 : 0);
  }

  async add(input: AddToIcuWaitlistInput) {
    const availableIcuBed = await prisma.bed.findFirst({
      where: { bedType: BedType.ICU, status: BedStatus.AVAILABLE },
      select: { id: true },
    });

    if (availableIcuBed) {
      return {
        success: false,
        message: 'An ICU bed is available now. Book the available bed instead of joining the waitlist.',
      };
    }

    const existing = await prisma.iCUWaitlistEntry.findFirst({
      where: {
        patientId: input.patientId,
        status: { in: [ICUWaitlistStatus.WAITING, ICUWaitlistStatus.NOTIFIED] },
      },
    });

    if (existing) {
      return { success: false, message: 'This patient is already on the active ICU waitlist.' };
    }

    const priorityScore = this.calculatePriorityScore(input.clinicalUrgency, !!input.requiresVentilator);
    const entry = await prisma.iCUWaitlistEntry.create({
      data: { ...input, requiresVentilator: !!input.requiresVentilator, priorityScore },
      include: { patient: true },
    });

    return { success: true, entry };
  }

  async getActiveEntries() {
    return prisma.iCUWaitlistEntry.findMany({
      where: { status: { in: [ICUWaitlistStatus.WAITING, ICUWaitlistStatus.NOTIFIED] } },
      include: { patient: { select: { id: true, name: true, phone: true } } },
      orderBy: [{ priorityScore: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async notifyNextPatientForAvailableIcuBed(bedId: string): Promise<void> {
    const result = await prisma.$transaction(async (tx) => {
      const bed = await tx.bed.findUnique({ where: { id: bedId }, select: { bedType: true, status: true, bedNumber: true } });
      if (!bed || bed.bedType !== BedType.ICU || bed.status !== BedStatus.AVAILABLE) return null;

      const entry = await tx.iCUWaitlistEntry.findFirst({
        where: { status: ICUWaitlistStatus.WAITING },
        orderBy: [{ priorityScore: 'desc' }, { createdAt: 'asc' }],
      });
      if (!entry) return null;

      const notifiedAt = new Date();
      await tx.iCUWaitlistEntry.update({
        where: { id: entry.id },
        data: { status: ICUWaitlistStatus.NOTIFIED, notifiedAt },
      });
      const notification = await tx.notification.create({
        data: {
          userId: entry.requestedById,
          waitlistEntryId: entry.id,
          type: 'ICU_BED_AVAILABLE',
          title: 'ICU bed available',
          message: `ICU bed ${bed.bedNumber} is now available for your waitlisted patient.`,
        },
      });

      return { entryId: entry.id, userId: entry.requestedById, notificationId: notification.id, bedNumber: bed.bedNumber };
    });

    if (result) emitIcuBedAvailable({ bedId, ...result });
  }
}

export const icuWaitlistService = new ICUWaitlistService();
