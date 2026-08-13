import { NextRequest, NextResponse } from 'next/server';
import { lockService } from '@/services/lockService';
import { z } from 'zod';

const lockRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    const { bedId } = await params;
    const body = await request.json();
    
    const validation = lockRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId } = validation.data;
    const result = await lockService.lockBed(bedId, userId);

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error locking bed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to lock bed' },
      { status: 500 }
    );
  }
}
