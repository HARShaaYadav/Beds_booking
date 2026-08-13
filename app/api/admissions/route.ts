import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { admissionService } from '@/services/admissionService';
import { createChildLogger } from '@/lib/logger';

const logger = createChildLogger('admissions-api');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['DOCTOR', 'NURSE', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = (session.user as any).id || (session.user as any).email;
    const body = await request.json();
    const { action, bookingId, admissionId, notes } = body;

    if (action === 'admit') {
      const result = await admissionService.admitPatient(
        bookingId,
        userId,
        notes
      );

      if (result.success) {
        return NextResponse.json(
          { admissionId: result.admissionId },
          { status: 201 }
        );
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    } else if (action === 'discharge') {
      const result = await admissionService.dischargePatient(
        admissionId,
        userId
      );

      if (result.success) {
        return NextResponse.json({ message: 'Patient discharged' });
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error({ error }, 'Error in admissions API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await admissionService.getOccupancyMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    logger.error({ error }, 'Error fetching occupancy metrics');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
