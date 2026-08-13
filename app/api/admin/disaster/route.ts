import { NextRequest, NextResponse } from 'next/server';
import { enqueueAuditLog } from '@/lib/queue';
import { isDisasterMode, setDisasterMode, getOverflowWards } from '@/lib/disaster';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const { action, userId } = body;
    if (action === 'activate') {
      setDisasterMode(true);
      await enqueueAuditLog({ userId, action: 'DISASTER_MODE_ACTIVATED', resource: 'System', resourceId: 'disaster', metadata: {} });
      return NextResponse.json({ success: true, disasterMode: isDisasterMode(), overflowWards: getOverflowWards() });
    }
    if (action === 'deactivate') {
      setDisasterMode(false);
      await enqueueAuditLog({ userId, action: 'DISASTER_MODE_DEACTIVATED', resource: 'System', resourceId: 'disaster', metadata: {} });
      return NextResponse.json({ success: true, disasterMode: isDisasterMode(), overflowWards: getOverflowWards() });
    }
    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Disaster API error', error);
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ success: true, disasterMode: isDisasterMode(), overflowWards: getOverflowWards() });
}
