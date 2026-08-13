import { prisma } from '@/lib/prisma';
import { BedStatus, BookingStatus, Prisma } from '@prisma/client';
import { BookingWithDetails, ConfirmBookingResponse } from '@/types/booking';
import { emitBedStatusChange } from '@/lib/socket';

export class BookingService {
  async confirmBooking(
    bookingId: string,
    patientId: string,
    userId: string
  ): Promise<ConfirmBookingResponse> {
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Get booking with bed
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            bed: true,
          },
        });

        if (!booking) {
          return { success: false, message: 'Booking not found.' };
        }

        // Verify ownership
        if (booking.bookedById !== userId) {
          return { success: false, message: 'You do not own this booking.' };
        }

        // Verify booking status
        if (booking.status !== BookingStatus.LOCKED) {
          return { success: false, message: 'Booking is not in locked state.' };
        }

        // Verify lock hasn't expired
        if (booking.lockExpiresAt && booking.lockExpiresAt < new Date()) {
          return { success: false, message: 'Lock has expired.' };
        }

        // Verify bed status
        if (booking.bed.status !== BedStatus.LOCKED) {
          return { success: false, message: 'Bed is not locked.' };
        }

        // Verify bed lock ownership
        if (booking.bed.lockedById !== userId) {
          return { success: false, message: 'You do not own the bed lock.' };
        }

        // Update booking
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            patientId,
            lockExpiresAt: null,
          },
        });

        // Update bed
        await tx.bed.update({
          where: { id: booking.bedId },
          data: {
            status: BedStatus.BOOKED,
            patientId,
            lockedById: null,
            lockedUntil: null,
          },
        });

        // Create history
        await tx.bedStatusHistory.create({
          data: {
            bedId: booking.bedId,
            oldStatus: BedStatus.LOCKED,
            newStatus: BedStatus.BOOKED,
            changedById: userId,
          },
        });

        return { success: true, bookingId };
      });

      if (result.success) {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { bed: true },
        });

        if (booking) {
          emitBedStatusChange({
            bedId: booking.bedId,
            status: BedStatus.BOOKED,
            lockedById: null,
            lockedUntil: null,
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error confirming booking:', error);
      return { success: false, message: 'Failed to confirm booking.' };
    }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { bed: true },
        });

        if (!booking) {
          return { success: false, message: 'Booking not found.' };
        }

        if (booking.bookedById !== userId) {
          return { success: false, message: 'You do not own this booking.' };
        }

        if (booking.status !== BookingStatus.LOCKED) {
          return { success: false, message: 'Only locked bookings can be cancelled.' };
        }

        // Update booking
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CANCELLED,
          },
        });

        // Release bed
        await tx.bed.update({
          where: { id: booking.bedId },
          data: {
            status: BedStatus.AVAILABLE,
            lockedById: null,
            lockedUntil: null,
          },
        });

        // Create history
        await tx.bedStatusHistory.create({
          data: {
            bedId: booking.bedId,
            oldStatus: BedStatus.LOCKED,
            newStatus: BedStatus.AVAILABLE,
            changedById: userId,
          },
        });

        emitBedStatusChange({
          bedId: booking.bedId,
          status: BedStatus.AVAILABLE,
          lockedById: null,
          lockedUntil: null,
        });

        return { success: true };
      });

      return result;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, message: 'Failed to cancel booking.' };
    }
  }

  async getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bed: {
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        bookedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return booking;
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        bookedById: userId,
        status: {
          in: [BookingStatus.LOCKED, BookingStatus.CONFIRMED],
        },
      },
      include: {
        bed: {
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }
}

export const bookingService = new BookingService();
