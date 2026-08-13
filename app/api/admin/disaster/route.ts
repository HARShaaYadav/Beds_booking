import { NextRequest, NextResponse } from 'next/server';
import { enqueueAuditLog } from '@/lib/queue';

let disasterMode = false;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;
    if (action === 'activate') {
      disasterMode = true;
      await enqueueAuditLog({ userId, action: 'DISASTER_MODE_ACTIVATED', resource: 'System', resourceId: 'disaster', metadata: {} });
      return NextResponse.json({ success: true, disasterMode });
    }
    if (action === 'deactivate') {
      disasterMode = false;
      await enqueueAuditLog({ userId, action: 'DISASTER_MODE_DEACTIVATED', resource: 'System', resourceId: 'disaster', metadata: {} });
      return NextResponse.json({ success: true, disasterMode });
    }
    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Disaster API error', error);
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ success: true, disasterMode });
}
