import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { admissionService } from '@/services/admissionService';
import { createChildLogger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const logger = createChildLogger('cleaning-api');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['NURSE', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = (session.user as any).id || (session.user as any).email;
    const body = await request.json();
    const { taskId, action } = body;

    if (action === 'complete') {
      const result = await admissionService.completeCleaning(
        taskId,
        userId
      );

      if (result.success) {
        return NextResponse.json({ message: 'Cleaning completed' });
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error({ error }, 'Error in cleaning API');
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

    const userRole = (session.user as any).role;
    if (!['NURSE', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get cleaning tasks for current user
    const userId = (session.user as any).id || (session.user as any).email;
    const tasks = await prisma.cleaningTask.findMany({
      where: {
        assignedTo: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      include: {
        bed: {
          include: {
            hospital: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logger.error({ error }, 'Error fetching cleaning tasks');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
