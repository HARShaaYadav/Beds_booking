import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { bedService } from '@/services/bedService';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    const { bedId } = await params;
    const user = await getCurrentUser();
    if (!['ADMIN', 'RECEPTIONIST', 'NURSE'].includes(user.role)) {
      return NextResponse.json({ success: false, message: 'You do not have permission to complete cleaning.' }, { status: 403 });
    }

    const result = await bedService.completeCleaningForBed(bedId, user.id);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    console.error('Error completing bed cleaning:', error);
    return NextResponse.json({ success: false, message: 'Failed to complete cleaning.' }, { status: 500 });
  }
}
