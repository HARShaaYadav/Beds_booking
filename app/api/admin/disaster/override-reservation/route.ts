import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enqueueAuditLog } from '@/lib/queue';
import { emitBedStatusChange } from '@/lib/socket';
import { requireRole } from '@/lib/auth';

/**
 * Emergency override: force confirm a booking and occupy the bed regardless of locks.
 * Body: { bookingId, adminUserId, reason }
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const { bookingId, adminUserId, reason } = body;
    if (!bookingId || !adminUserId) return NextResponse.json({ success: false, message: 'bookingId and adminUserId required' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { bed: true } });
      if (!booking) return { success: false, message: 'Booking not found' };

      const previousOwner = booking.bookedById;
      const oldBedStatus = booking.bed.status;

      await tx.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED', lockExpiresAt: null } });

      await tx.bed.update({ where: { id: booking.bedId }, data: { status: 'OCCUPIED', patientId: booking.patientId, lockedById: null, lockedUntil: null } });

      await tx.bedStatusHistory.create({ data: { bedId: booking.bedId, oldStatus: oldBedStatus, newStatus: 'OCCUPIED', changedById: adminUserId } });

      return { success: true, bookingId, bedId: booking.bedId, previousOwner };
    }, { isolationLevel: 'Serializable' });

    if (result.success) {
      enqueueAuditLog({ userId: adminUserId, action: 'EMERGENCY_OVERRIDE', resource: 'Booking', resourceId: bookingId, metadata: { reason, previousOwner: result.previousOwner } });
      const bedId = result.bedId as string | undefined;
      if (bedId) {
        emitBedStatusChange({ bedId, status: 'OCCUPIED', lockedById: null, lockedUntil: null });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Override reservation error', error);
    return NextResponse.json({ success: false, message: 'Failed to override reservation' }, { status: 500 });
  }
}
