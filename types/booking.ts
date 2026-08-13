import { BookingStatus } from '@prisma/client';
import { BedWithDetails } from './bed';

export interface BookingWithDetails {
  id: string;
  bedId: string;
  patientId: string | null;
  bookedById: string;
  status: BookingStatus;
  lockExpiresAt: Date | null;
  bookedAt: Date;
  admissionAt: Date | null;
  dischargeAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bed?: BedWithDetails;
  patient?: {
    id: string;
    name: string;
    phone: string;
    dateOfBirth: Date;
    gender: string;
  } | null;
  bookedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ConfirmBookingRequest {
  patientId: string;
}

export interface ConfirmBookingResponse {
  success: boolean;
  bookingId?: string;
  message?: string;
}
