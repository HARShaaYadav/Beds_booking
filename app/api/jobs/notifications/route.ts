import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function POST(request: NextRequest) {
  if (!process.env.NOTIFICATION_WORKER_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.NOTIFICATION_WORKER_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await notificationService.processDueJobs());
}
