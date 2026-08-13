import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BedService } from '@/services/bedService';
import { prisma } from '@/lib/prisma';
import { BedStatus, BookingStatus } from '@prisma/client';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    bed: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    bedStatusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('BedService', () => {
  let bedService: BedService;

  beforeEach(() => {
    bedService = new BedService();
    vi.clearAllMocks();
  });

  describe('getBeds', () => {
    it('should return all beds', async () => {
      const mockBeds = [
        {
          id: 'bed-1',
          bedNumber: '101',
          bedType: 'GENERAL',
          status: BedStatus.AVAILABLE,
        },
      ];

      vi.mocked(prisma.bed.findMany).mockResolvedValueOnce(mockBeds as any);

      const beds = await bedService.getBeds();

      expect(beds).toEqual(mockBeds);
      expect(prisma.bed.findMany).toHaveBeenCalled();
    });

    it('should filter beds by status', async () => {
      const mockBeds = [
        {
          id: 'bed-1',
          bedNumber: '101',
          status: BedStatus.AVAILABLE,
        },
      ];

      vi.mocked(prisma.bed.findMany).mockResolvedValueOnce(mockBeds as any);

      const beds = await bedService.getBeds({ status: BedStatus.AVAILABLE });

      expect(beds).toEqual(mockBeds);
      expect(prisma.bed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: BedStatus.AVAILABLE,
          }),
        })
      );
    });
  });

  describe('getBedStatistics', () => {
    it('should return bed statistics', async () => {
      vi.mocked(prisma.bed.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(50) // available
        .mockResolvedValueOnce(10) // locked
        .mockResolvedValueOnce(20) // booked
        .mockResolvedValueOnce(15) // occupied
        .mockResolvedValueOnce(4) // cleaning
        .mockResolvedValueOnce(1); // maintenance

      const stats = await bedService.getBedStatistics();

      expect(stats).toEqual({
        total: 100,
        available: 50,
        locked: 10,
        booked: 20,
        occupied: 15,
        cleaning: 4,
        maintenance: 1,
      });
    });
  });

  describe('releaseExpiredLocks', () => {
    it('should release expired locks', async () => {
      const expiredBeds = [
        {
          id: 'bed-1',
          lockedId: 'user-1',
          lockedUntil: new Date('2024-01-01'),
          bookings: [{ id: 'booking-1' }],
        },
      ];

      vi.mocked(prisma.bed.findMany).mockResolvedValueOnce(expiredBeds as any);

      await bedService.releaseExpiredLocks();

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
