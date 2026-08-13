import { BedType, BedStatus } from '@prisma/client';

export interface BedWithDetails {
  id: string;
  hospitalId: string;
  bedNumber: string;
  bedType: BedType;
  ward: string;
  floor: number;
  status: BedStatus;
  lockedById: string | null;
  lockedUntil: Date | null;
  patientId: string | null;
  createdAt: Date;
  updatedAt: Date;
  hospital?: {
    id: string;
    name: string;
  };
  patient?: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

export interface BedLockResponse {
  success: boolean;
  bedId?: string;
  status?: BedStatus;
  lockedUntil?: string;
  bookingId?: string;
  message?: string;
}

export interface BedFilters {
  bedType?: BedType;
  status?: BedStatus;
  ward?: string;
  floor?: number;
  search?: string;
}
