import { NextRequest, NextResponse } from 'next/server';
import { patientService } from '@/services/patientService';
import { z } from 'zod';

const createPatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Search query is required' },
        { status: 400 }
      );
    }

    const patients = await patientService.searchPatients(query);

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to search patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = createPatientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const patient = await patientService.createPatient(validation.data);

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
