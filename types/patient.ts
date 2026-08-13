export interface Patient {
  id: string;
  name: string;
  phone: string;
  mrn?: string | null;
  bloodGroup?: string | null;
  allergies?: string[];
  isolationRequired?: boolean;
  criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dateOfBirth: Date;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientRequest {
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  mrn?: string;
  bloodGroup?: string;
  allergies?: string[];
  isolationRequired?: boolean;
  criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PatientSearchResult {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  mrn?: string | null;
}
