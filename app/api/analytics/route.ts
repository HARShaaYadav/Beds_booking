import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Total beds and occupied
    const totalBeds = await prisma.bed.count();
    const occupiedBeds = await prisma.bed.count({ where: { status: 'OCCUPIED' } });

    // ICU utilization
    const totalIcu = await prisma.bed.count({ where: { bedType: 'ICU' } });
    const occupiedIcu = await prisma.bed.count({ where: { bedType: 'ICU', status: 'OCCUPIED' } });

    // Average length of stay (in hours) based on admissions with dischargedAt
    const losRows = await prisma.$queryRawUnsafe(`
      SELECT AVG(EXTRACT(EPOCH FROM ("dischargedAt" - "admittedAt"))/3600.0) as avg_hours
      FROM "Admission"
      WHERE "dischargedAt" IS NOT NULL
    `);
    const avgLosHours = Array.isArray(losRows) && losRows[0] ? Number(losRows[0].avg_hours) || 0 : 0;

    // Turnaround time after discharge: average time (hours) between discharge and next bed available event
    const turnaroundRows = await prisma.$queryRawUnsafe(`
      SELECT AVG(EXTRACT(EPOCH FROM (bh."createdAt" - a."dischargedAt"))/3600.0) as turnaround_hours
      FROM "Admission" a
      JOIN "BedStatusHistory" bh ON bh."bedId" = a."bedId" AND bh."oldStatus" = 'OCCUPIED' AND bh."newStatus" = 'AVAILABLE' AND bh."createdAt" > a."dischargedAt"
      WHERE a."dischargedAt" IS NOT NULL
    `);
    const avgTurnaroundHours = Array.isArray(turnaroundRows) && turnaroundRows[0] ? Number(turnaroundRows[0].turnaround_hours) || 0 : 0;

    // Peak occupancy hours (group by hour of day for admissions)
    const peakRows = await prisma.$queryRawUnsafe(`
      SELECT DATE_PART('hour', "admissionAt") as hour, COUNT(*) as cnt
      FROM "Admission"
      WHERE "admissionAt" IS NOT NULL
      GROUP BY hour
      ORDER BY cnt DESC
      LIMIT 6
    `);

    // Cancellation rate: cancelled bookings / total bookings in last 30 days
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const totalBookings = await prisma.booking.count({ where: { createdAt: { gte: since } } });
    const cancelledBookings = await prisma.booking.count({ where: { createdAt: { gte: since }, status: 'CANCELLED' } });
    const cancellationRate = totalBookings ? (cancelledBookings / totalBookings) * 100 : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        occupancyRate: totalBeds ? (occupiedBeds / totalBeds) * 100 : 0,
        icuUtilization: totalIcu ? (occupiedIcu / totalIcu) * 100 : 0,
        avgLengthOfStayHours: avgLosHours,
        avgTurnaroundHours,
        peakHours: peakRows,
        cancellationRate,
      },
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return NextResponse.json({ success: false, message: 'Failed to compute analytics' }, { status: 500 });
  }
}
