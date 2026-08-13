import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enqueueAuditLog } from '@/lib/queue';
import { emitBedStatusChange } from '@/lib/socket';
import { getOverflowWards, isDisasterMode, getReservedBuffer } from '@/lib/disaster';
import { requireRole } from '@/lib/auth';
import { chooseBedFromList } from '@/lib/assign';

/**
 * Rapid assign patients to available beds during mass casualty.
 * Body: { assignments: [{ patientId, preferredType? }], userId }
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const { assignments, userId } = body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ success: false, message: 'Assignments required' }, { status: 400 });
    }

    const results: Array<any> = [];
    // Fetch global buffer and overflow wards
    const buffer = await getReservedBuffer().catch(() => 3);
    const overflow = await getOverflowWards().catch(() => []);

    // Pre-fetch all available beds to apply clustering and prioritization
    const availableBeds = await prisma.bed.findMany({ where: { status: 'AVAILABLE' } });

    let assignedCount = 0;
    for (const assign of assignments) {
      const { patientId, preferredType } = assign;

      // Reserve a buffer of beds for expected arrivals
      if (availableBeds.length - assignedCount <= buffer) {
        results.push({ success: false, message: 'Insufficient beds (reserved buffer)', patientId });
        continue;
      }

      // Choose a bed from the pre-fetched list using improved algorithm
      const chosen = chooseBedFromList(availableBeds.filter(b => b.status === 'AVAILABLE'), preferredType, overflow);
      if (!chosen) {
        results.push({ success: false, message: 'No available bed', patientId });
        continue;
      }

      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({ data: { bedId: chosen.id, patientId, bookedById: userId, status: 'CONFIRMED', bookedAt: new Date() } });
        await tx.bed.update({ where: { id: chosen.id }, data: { status: 'OCCUPIED', patientId } });
        await tx.bedStatusHistory.create({ data: { bedId: chosen.id, oldStatus: 'AVAILABLE', newStatus: 'OCCUPIED', changedById: userId } });
        return { success: true, bookingId: booking.id, bedId: chosen.id, patientId };
      }, { isolationLevel: 'Serializable' });

      if (result.success) {
        assignedCount += 1;
        // mark bed as no longer available in our local list
        const idx = availableBeds.findIndex(b => b.id === result.bedId);
        if (idx >= 0) availableBeds.splice(idx, 1);
        enqueueAuditLog({ userId, action: 'RAPID_ASSIGN', resource: 'Booking', resourceId: result.bookingId, metadata: { patientId: result.patientId, bedId: result.bedId } });
        emitBedStatusChange({ bedId: result.bedId, status: 'OCCUPIED', lockedById: null, lockedUntil: null });
      }

      results.push(result);
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Rapid assign error', error);
    return NextResponse.json({ success: false, message: 'Failed to rapid assign' }, { status: 500 });
  }
}
