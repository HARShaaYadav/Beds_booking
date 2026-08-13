import { NextRequest, NextResponse } from 'next/server';
import { bedService } from '@/services/bedService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    const { bedId } = await params;
    const bed = await bedService.getBedById(bedId);

    if (!bed) {
      return NextResponse.json(
        { success: false, message: 'Bed not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bed,
    });
  } catch (error) {
    console.error('Error fetching bed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bed' },
      { status: 500 }
    );
  }
}
