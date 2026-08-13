import { prisma } from '@/lib/prisma';
import { BedStatus, BookingStatus } from '@prisma/client';
import { BedLockResponse } from '@/types/bed';
import { emitBedStatusChange } from '@/lib/socket';

export class LockService {
  private readonly LOCK_DURATION_MINUTES = 5;

  async lockBed(bedId: string, userId: string): Promise<BedLockResponse> {
    const lockExpiresAt = new Date();
    lockExpiresAt.setMinutes(lockExpiresAt.getMinutes() + this.LOCK_DURATION_MINUTES);

    try {
      // Use transaction with atomic update
      const result = await prisma.$transaction(async (tx) => {
        // First, check if bed exists
        const bed = await tx.bed.findUnique({
          where: { id: bedId },
        });

        if (!bed) {
          return {
            success: false,
            message: 'Bed not found.',
          };
        }

        // Check if lock has expired and release it first
        if (bed.status === BedStatus.LOCKED && bed.lockedUntil && bed.lockedUntil < new Date()) {
          await tx.bed.update({
            where: { id: bedId },
            data: {
              status: BedStatus.AVAILABLE,
              lockedById: null,
              lockedUntil: null,
            },
          });

          await tx.booking.updateMany({
            where: {
              bedId: bedId,
              status: BookingStatus.LOCKED,
            },
            data: {
              status: BookingStatus.EXPIRED,
            },
          });

          bed.status = BedStatus.AVAILABLE;
        }

        // Atomic update - only succeed if status is AVAILABLE
        const updatedBed = await tx.bed.updateMany({
          where: {
            id: bedId,
            status: BedStatus.AVAILABLE,
          },
          data: {
            status: BedStatus.LOCKED,
            lockedById: userId,
            lockedUntil: lockExpiresAt,
          },
        });

        // If no rows were updated, the bed was not available
        if (updatedBed.count === 0) {
          return {
            success: false,
            message: bed.status === BedStatus.LOCKED
              ? 'This bed is currently reserved by another user. Please choose another available bed.'
              : 'Bed is no longer available. Please choose another available bed.',
          };
        }

        // Create booking record
        const booking = await tx.booking.create({
          data: {
            bedId,
            bookedById: userId,
            status: BookingStatus.LOCKED,
            lockExpiresAt,
          },
        });

        // Create history record
        await tx.bedStatusHistory.create({
          data: {
            bedId,
            oldStatus: BedStatus.AVAILABLE,
            newStatus: BedStatus.LOCKED,
            changedById: userId,
          },
        });

        return {
          success: true,
          bedId,
          status: BedStatus.LOCKED,
          lockedUntil: lockExpiresAt.toISOString(),
          bookingId: booking.id,
        };
      });

      // Emit socket event if successful
      if (result.success && result.bedId) {
        emitBedStatusChange({
          bedId: result.bedId,
          status: BedStatus.LOCKED,
          lockedById: userId,
          lockedUntil: lockExpiresAt,
        });
      }

      return result;
    } catch (error) {
      console.error('Error locking bed:', error);
      return {
        success: false,
        message: 'Failed to lock bed. Please try again.',
      };
    }
  }

  async releaseLock(bedId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Verify lock ownership
        const bed = await tx.bed.findUnique({
          where: { id: bedId },
        });

        if (!bed) {
          return { success: false, message: 'Bed not found.' };
        }

        if (bed.lockedById !== userId) {
          return { success: false, message: 'You do not own this lock.' };
        }

        if (bed.status !== BedStatus.LOCKED) {
          return { success: false, message: 'Bed is not locked.' };
        }

        // Release the lock
        await tx.bed.update({
          where: { id: bedId },
          data: {
            status: BedStatus.AVAILABLE,
            lockedById: null,
            lockedUntil: null,
          },
        });

        // Update booking
        await tx.booking.updateMany({
          where: {
            bedId,
            bookedById: userId,
            status: BookingStatus.LOCKED,
          },
          data: {
            status: BookingStatus.CANCELLED,
          },
        });

        // Create history
        await tx.bedStatusHistory.create({
          data: {
            bedId,
            oldStatus: BedStatus.LOCKED,
            newStatus: BedStatus.AVAILABLE,
            changedById: userId,
          },
        });

        return { success: true };
      });

      if (result.success) {
        emitBedStatusChange({
          bedId,
          status: BedStatus.AVAILABLE,
          lockedById: null,
          lockedUntil: null,
        });
      }

      return result;
    } catch (error) {
      console.error('Error releasing lock:', error);
      return { success: false, message: 'Failed to release lock.' };
    }
  }
}

export const lockService = new LockService();
