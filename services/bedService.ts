import { prisma } from '@/lib/prisma';
import { BedType, BedStatus, BookingStatus } from '@prisma/client';
import { BedWithDetails, BedFilters } from '@/types/bed';
import { emitBedStatusChange } from '@/lib/socket';
import { icuWaitlistService } from '@/services/icuWaitlistService';

export class BedService {
  async getBeds(filters?: BedFilters): Promise<BedWithDetails[]> {
    const where: any = {};

    if (filters?.bedType) {
      where.bedType = filters.bedType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.ward) {
      where.ward = {
        contains: filters.ward,
        mode: 'insensitive',
      };
    }

    if (filters?.floor !== undefined) {
      where.floor = filters.floor;
    }

    if (filters?.search) {
      where.bedNumber = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const beds = await prisma.bed.findMany({
      where,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { bedType: 'asc' },
        { bedNumber: 'asc' },
      ],
    });

    return beds;
  }

  async getBedById(bedId: string): Promise<BedWithDetails | null> {
    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return bed;
  }

  async getAvailableBeds(bedType?: BedType): Promise<BedWithDetails[]> {
    const where: any = {
      status: BedStatus.AVAILABLE,
    };

    if (bedType) {
      where.bedType = bedType;
    }

    return this.getBeds({ ...where });
  }

  async getBedStatistics() {
    const [total, available, locked, booked, occupied, cleaning, maintenance] = await Promise.all([
      prisma.bed.count(),
      prisma.bed.count({ where: { status: BedStatus.AVAILABLE } }),
      prisma.bed.count({ where: { status: BedStatus.LOCKED } }),
      prisma.bed.count({ where: { status: BedStatus.BOOKED } }),
      prisma.bed.count({ where: { status: BedStatus.OCCUPIED } }),
      prisma.bed.count({ where: { status: BedStatus.CLEANING } }),
      prisma.bed.count({ where: { status: BedStatus.MAINTENANCE } }),
    ]);

    return {
      total,
      available,
      locked,
      booked,
      occupied,
      cleaning,
      maintenance,
    };
  }

  async sendOccupiedBedToCleaning(bedId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const bed = await tx.bed.findUnique({ where: { id: bedId } });

        if (!bed) {
          return { success: false, message: 'Bed not found.' };
        }

        if (bed.status !== BedStatus.OCCUPIED) {
          return { success: false, message: 'Only occupied beds can be sent to cleaning.' };
        }

        await tx.bed.update({
          where: { id: bedId },
          data: {
            status: BedStatus.CLEANING,
            patientId: null,
            lockedById: null,
            lockedUntil: null,
          },
        });

        await tx.booking.updateMany({
          where: { bedId, status: BookingStatus.CONFIRMED },
          data: { status: BookingStatus.COMPLETED, dischargeAt: new Date() },
        });

        await tx.cleaningTask.create({
          data: { bedId, assignedTo: userId },
        });

        await tx.bedStatusHistory.create({
          data: {
            bedId,
            oldStatus: BedStatus.OCCUPIED,
            newStatus: BedStatus.CLEANING,
            changedById: userId,
          },
        });

        return { success: true };
      });

      if (result.success) {
        emitBedStatusChange({
          bedId,
          status: BedStatus.CLEANING,
          lockedById: null,
          lockedUntil: null,
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending occupied bed to cleaning:', error);
      return { success: false, message: 'Failed to send bed to cleaning.' };
    }
  }

  async completeCleaningForBed(bedId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const bed = await tx.bed.findUnique({ where: { id: bedId } });
        if (!bed) return { success: false, message: 'Bed not found.' };
        if (bed.status !== BedStatus.CLEANING) {
          return { success: false, message: 'Only beds in cleaning can be made available.' };
        }

        const task = await tx.cleaningTask.findFirst({
          where: { bedId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
          orderBy: { createdAt: 'desc' },
        });
        if (!task) return { success: false, message: 'No active cleaning task was found for this bed.' };

        const completedAt = new Date();
        await tx.cleaningTask.update({
          where: { id: task.id },
          data: { status: 'COMPLETED', completedAt },
        });
        await tx.bed.update({
          where: { id: bedId },
          data: { status: BedStatus.AVAILABLE },
        });
        await tx.bedStatusHistory.create({
          data: {
            bedId,
            oldStatus: BedStatus.CLEANING,
            newStatus: BedStatus.AVAILABLE,
            changedById: userId,
          },
        });
        return { success: true };
      });

      if (result.success) {
        emitBedStatusChange({ bedId, status: BedStatus.AVAILABLE, lockedById: null, lockedUntil: null });
        await icuWaitlistService.notifyNextPatientForAvailableIcuBed(bedId);
      }
      return result;
    } catch (error) {
      console.error('Error completing cleaning:', error);
      return { success: false, message: 'Failed to complete cleaning.' };
    }
  }

  async releaseExpiredLocks(): Promise<void> {
    const now = new Date();

    // Find expired locks
    const expiredBeds = await prisma.bed.findMany({
      where: {
        status: BedStatus.LOCKED,
        lockedUntil: {
          lt: now,
        },
      },
      include: {
        bookings: {
          where: {
            status: BookingStatus.LOCKED,
          },
        },
      },
    });

    // Release each expired lock
    for (const bed of expiredBeds) {
      await prisma.$transaction(async (tx) => {
        // Update bed
        await tx.bed.update({
          where: { id: bed.id },
          data: {
            status: BedStatus.AVAILABLE,
            lockedById: null,
            lockedUntil: null,
          },
        });

        // Update bookings
        if (bed.bookings.length > 0) {
          await tx.booking.updateMany({
            where: {
              bedId: bed.id,
              status: BookingStatus.LOCKED,
            },
            data: {
              status: BookingStatus.EXPIRED,
            },
          });
        }

        // Create history record
        await tx.bedStatusHistory.create({
          data: {
            bedId: bed.id,
            oldStatus: BedStatus.LOCKED,
            newStatus: BedStatus.AVAILABLE,
            changedById: bed.lockedById || 'system',
          },
        });
      });

      emitBedStatusChange({
        bedId: bed.id,
        status: BedStatus.AVAILABLE,
        lockedById: null,
        lockedUntil: null,
      });
      await icuWaitlistService.notifyNextPatientForAvailableIcuBed(bed.id);
    }
  }
}

export const bedService = new BedService();
