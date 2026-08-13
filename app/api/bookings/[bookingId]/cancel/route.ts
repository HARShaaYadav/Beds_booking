import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/services/bookingService';
import { z } from 'zod';

const cancelRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    
    const validation = cancelRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId } = validation.data;
    const result = await bookingService.cancelBooking(bookingId, userId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
