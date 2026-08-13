import { NextRequest, NextResponse } from 'next/server';
import { lockService } from '@/services/lockService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    const { bedId } = await params;
    console.log('Lock API called for bedId:', bedId);

    const user = await getCurrentUser();
    const userId = user.id;
    console.log('Calling lockService.lockBed with:', { bedId, userId });

    const result = await lockService.lockBed(bedId, userId);
    console.log('Lock result:', result);

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error locking bed:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { success: false, message: 'Please sign in before booking a bed.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to lock bed' },
      { status: 500 }
    );
  }
}
