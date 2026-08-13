import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/services/bookingService';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const confirmRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    
    const validation = confirmRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { patientId } = validation.data;
    const user = await getCurrentUser();
    const result = await bookingService.confirmBooking(
      bookingId,
      patientId,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error confirming booking:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { success: false, message: 'Please sign in before confirming a booking.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
