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
      return NextResponse.json(
        { success: false, message: 'You do not have permission to release this bed.' },
        { status: 403 }
      );
    }

    const result = await bedService.makeOccupiedBedAvailable(bedId, user.id);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    console.error('Error releasing occupied bed:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { success: false, message: 'Please sign in before changing bed status.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to make bed available.' },
      { status: 500 }
    );
  }
}
