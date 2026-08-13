import { NextResponse } from 'next/server';
import { bedService } from '@/services/bedService';

export async function GET() {
  try {
    const statistics = await bedService.getBedStatistics();

    return NextResponse.json({
      success: true,
      statistics,
    });
  } catch (error) {
    console.error('Error fetching bed statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
