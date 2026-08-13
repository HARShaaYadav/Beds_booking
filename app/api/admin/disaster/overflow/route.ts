import { NextRequest, NextResponse } from 'next/server';
import { activateOverflowWard, deactivateOverflowWard, getOverflowWards } from '@/lib/disaster';
import { requireRole } from '@/lib/auth';
import { enqueueAuditLog } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const { action, ward, userId } = body;
    if (!ward) return NextResponse.json({ success: false, message: 'Ward required' }, { status: 400 });
    if (action === 'activate') {
      activateOverflowWard(ward);
      await enqueueAuditLog({ userId, action: 'OVERFLOW_WARD_ACTIVATED', resource: 'Ward', resourceId: ward, metadata: {} });
      return NextResponse.json({ success: true, overflowWards: getOverflowWards() });
    }
    if (action === 'deactivate') {
      deactivateOverflowWard(ward);
      await enqueueAuditLog({ userId, action: 'OVERFLOW_WARD_DEACTIVATED', resource: 'Ward', resourceId: ward, metadata: {} });
      return NextResponse.json({ success: true, overflowWards: getOverflowWards() });
    }
    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Overflow API error', error);
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ success: true, overflowWards: getOverflowWards() });
}
