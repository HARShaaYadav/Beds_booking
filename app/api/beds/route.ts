import { NextRequest, NextResponse } from 'next/server';
import { bedService } from '@/services/bedService';
import { BedType, BedStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: any = {};

    const bedType = searchParams.get('bedType');
    if (bedType && Object.values(BedType).includes(bedType as BedType)) {
      filters.bedType = bedType as BedType;
    }

    const status = searchParams.get('status');
    if (status && Object.values(BedStatus).includes(status as BedStatus)) {
      filters.status = status as BedStatus;
    }

    const ward = searchParams.get('ward');
    if (ward) {
      filters.ward = ward;
    }

    const floor = searchParams.get('floor');
    if (floor) {
      filters.floor = parseInt(floor);
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const beds = await bedService.getBeds(filters);

    return NextResponse.json({
      success: true,
      beds,
    });
  } catch (error) {
    console.error('Error fetching beds:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch beds' },
      { status: 500 }
    );
  }
}
