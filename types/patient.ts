export interface Patient {
  id: string;
  name: string;
  phone: string;
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
}

export interface PatientSearchResult {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
}
