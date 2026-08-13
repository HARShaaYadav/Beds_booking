import { prisma } from '@/lib/prisma';
import { Patient, CreatePatientRequest, PatientSearchResult } from '@/types/patient';

export class PatientService {
  async searchPatients(query: string): Promise<PatientSearchResult[]> {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        mrn: true,
        dateOfBirth: true,
        gender: true,
      },
      take: 10,
    });

    return patients;
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    return patient;
  }

  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        mrn: data.mrn ?? undefined,
        bloodGroup: data.bloodGroup ?? undefined,
        allergies: data.allergies ?? undefined,
        isolationRequired: data.isolationRequired ?? undefined,
        criticality: data.criticality ?? undefined,
      },
    });

    return patient;
  }
}

export const patientService = new PatientService();
