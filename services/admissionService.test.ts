import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdmissionService } from '@/services/admissionService';
import { prisma } from '@/lib/prisma';
import { BedStatus, BookingStatus, AdmissionStatus } from '@prisma/client';

vi.mock('@/lib/prisma');
vi.mock('@/lib/queue', () => ({
  enqueueAuditLog: vi.fn(),
  enqueueCleaning: vi.fn(),
}));
vi.mock('@/lib/socket', () => ({
  emitBedStatusChange: vi.fn(),
}));

describe('AdmissionService', () => {
  let admissionService: AdmissionService;

  beforeEach(() => {
    admissionService = new AdmissionService();
    vi.clearAllMocks();
  });

  describe('admitPatient', () => {
    it('should admit a patient successfully', async () => {
      const mockBooking = {
        id: 'booking-1',
        bedId: 'bed-1',
        patientId: 'patient-1',
        status: BookingStatus.CONFIRMED,
        bed: { id: 'bed-1', status: BedStatus.BOOKED },
        patient: { id: 'patient-1', name: 'John Doe' },
      };

      const mockAdmission = {
        id: 'admission-1',
        bookingId: 'booking-1',
        bedId: 'bed-1',
        patientId: 'patient-1',
        status: AdmissionStatus.ADMITTED,
      };

      const mockTx = {
        booking: {
          findUnique: vi.fn().mockResolvedValueOnce(mockBooking),
          update: vi.fn(),
        },
        admission: {
          findUnique: vi.fn().mockResolvedValueOnce(null),
          create: vi.fn().mockResolvedValueOnce(mockAdmission),
        },
        bed: {
          update: vi.fn(),
        },
        bedStatusHistory: {
          create: vi.fn(),
        },
      };

      vi.mocked(prisma.$transaction).mockResolvedValueOnce({
        success: true,
        admissionId: 'admission-1',
      });

      const result = await admissionService.admitPatient(
        'booking-1',
        'doctor-1',
        'Notes'
      );

      expect(result.success).toBe(true);
      expect(result.admissionId).toBe('admission-1');
    });

    it('should fail if booking is not confirmed', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: BookingStatus.LOCKED,
      };

      const mockTx = {
        booking: {
          findUnique: vi.fn().mockResolvedValueOnce(mockBooking),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementationOnce(
        (callback: any) => callback(mockTx)
      );

      const result = await admissionService.admitPatient('booking-1', 'doctor-1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('confirmed');
    });

    it('should fail if patient already admitted', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        bedId: 'bed-1',
        patientId: 'patient-1',
      };

      const mockAdmission = {
        id: 'admission-1',
        bookingId: 'booking-1',
      };

      const mockTx = {
        booking: {
          findUnique: vi.fn().mockResolvedValueOnce(mockBooking),
        },
        admission: {
          findUnique: vi.fn().mockResolvedValueOnce(mockAdmission),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementationOnce(
        (callback: any) => callback(mockTx)
      );

      const result = await admissionService.admitPatient('booking-1', 'doctor-1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already admitted');
    });
  });

  describe('dischargePatient', () => {
    it('should discharge a patient successfully', async () => {
      const mockAdmission = {
        id: 'admission-1',
        bedId: 'bed-1',
        bookingId: 'booking-1',
        status: AdmissionStatus.ADMITTED,
      };

      const mockTx = {
        admission: {
          findUnique: vi.fn().mockResolvedValueOnce(mockAdmission),
          update: vi.fn(),
        },
        bed: {
          update: vi.fn(),
        },
        booking: {
          update: vi.fn(),
        },
        bedStatusHistory: {
          create: vi.fn(),
        },
      };

      vi.mocked(prisma.$transaction).mockResolvedValueOnce({
        success: true,
      });

      const result = await admissionService.dischargePatient(
        'admission-1',
        'doctor-1'
      );

      expect(result.success).toBe(true);
    });

    it('should fail if admission not found', async () => {
      const mockTx = {
        admission: {
          findUnique: vi.fn().mockResolvedValueOnce(null),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementationOnce(
        (callback: any) => callback(mockTx)
      );

      const result = await admissionService.dischargePatient(
        'invalid-id',
        'doctor-1'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('getOccupancyMetrics', () => {
    it('should return occupancy metrics', async () => {
      vi.mocked(prisma.bed.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(50) // occupied
        .mockResolvedValueOnce(10) // cleaning
        .mockResolvedValueOnce(40); // available

      vi.mocked(prisma.admission.count).mockResolvedValueOnce(50);

      const metrics = await admissionService.getOccupancyMetrics();

      expect(metrics.total).toBe(100);
      expect(metrics.occupied).toBe(50);
      expect(metrics.cleaning).toBe(10);
      expect(metrics.available).toBe(40);
      expect(metrics.currentAdmissions).toBe(50);
      expect(metrics.occupancyRate).toBe('50.00');
    });
  });
});
