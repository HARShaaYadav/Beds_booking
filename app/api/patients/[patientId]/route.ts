import { NextRequest, NextResponse } from 'next/server';
import { patientService } from '@/services/patientService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const patient = await patientService.getPatientById(patientId);

    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
