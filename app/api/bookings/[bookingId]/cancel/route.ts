import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/services/bookingService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const user = await getCurrentUser();
    const result = await bookingService.cancelBooking(bookingId, user.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { success: false, message: 'Please sign in before cancelling a booking.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
