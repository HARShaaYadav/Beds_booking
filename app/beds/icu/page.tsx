'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BedType } from '@prisma/client';
import { BedWithDetails } from '@/types/bed';
import { BedGrid } from '@/components/beds/BedGrid';
import { getSocket } from '@/components/realtime/LiveConnectionStatus';

export default function ICUBedsPage() {
  const router = useRouter();
  const [beds, setBeds] = useState<BedWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const fetchBeds = async () => {
    try {
      const response = await fetch(`/api/beds?bedType=${BedType.ICU}`);
      const data = await response.json();

      if (data.success) {
        setBeds(data.beds);
      }
    } catch (error) {
      console.error('Error fetching ICU beds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();

    // Set up real-time updates
    const socket = getSocket();

    const handleBedStatusChange = (data: any) => {
      setBeds((prevBeds) =>
        prevBeds.map((bed) =>
          bed.id === data.bedId
            ? { ...bed, status: data.status, lockedById: data.lockedById, lockedUntil: data.lockedUntil }
            : bed
        )
      );
    };

    socket.on('bed-status-changed', handleBedStatusChange);

    return () => {
      socket.off('bed-status-changed', handleBedStatusChange);
    };
  }, []);

  const handleBookBed = async (bedId: string) => {
    if (isBooking) return;

    setIsBooking(true);
    try {
      const response = await fetch(`/api/beds/${bedId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.bookingId) {
        router.push(`/booking/${data.bookingId}`);
      } else {
        alert(data.message || 'Failed to lock bed');
      }
    } catch (error) {
      console.error('Error locking bed:', error);
      alert('Failed to lock bed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleReleaseBed = async (bedId: string) => {
    if (isReleasing || !confirm('Mark this occupied bed as available?')) return;

    setIsReleasing(true);
    try {
      const response = await fetch(`/api/beds/${bedId}/release`, { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await fetchBeds();
      } else {
        alert(data.message || 'Failed to make bed available.');
      }
    } catch (error) {
      console.error('Error releasing bed:', error);
      alert('Failed to make bed available.');
    } finally {
      setIsReleasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">ICU Beds</h1>
        </div>
        <p className="text-gray-600 text-lg">Intensive Care Unit bed availability</p>
      </div>

      {beds.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-6 rounded-full">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 text-lg font-medium">No ICU beds available at this time.</p>
          <p className="text-gray-400 text-sm mt-2">Please check back later or contact reception.</p>
        </div>
      ) : (
        <BedGrid
          beds={beds}
          onBook={handleBookBed}
          onRelease={handleReleaseBed}
          isBooking={isBooking}
          isReleasing={isReleasing}
        />
      )}
    </div>
  );
}
