import { prisma } from '@/lib/prisma';
import { BedType, BedStatus, BookingStatus } from '@prisma/client';
import { BedWithDetails, BedFilters } from '@/types/bed';

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
    }
  }
}

export const bedService = new BedService();
