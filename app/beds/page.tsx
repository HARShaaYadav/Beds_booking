'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BedType, BedStatus } from '@prisma/client';
import { BedWithDetails } from '@/types/bed';
import { BedGrid } from '@/components/beds/BedGrid';
import { BedFilters } from '@/components/beds/BedFilters';
import { getSocket } from '@/components/realtime/LiveConnectionStatus';

// Mock user ID - in production, this would come from authentication
const CURRENT_USER_ID = 'mock-user-id';

export default function BedsPage() {
  const router = useRouter();
  const [beds, setBeds] = useState<BedWithDetails[]>([]);
  const [filteredBeds, setFilteredBeds] = useState<BedWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedType, setSelectedType] = useState<BedType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<BedStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBeds = async () => {
    try {
      const response = await fetch('/api/beds');
      const data = await response.json();

      if (data.success) {
        setBeds(data.beds);
      }
    } catch (error) {
      console.error('Error fetching beds:', error);
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

  useEffect(() => {
    let filtered = beds;

    if (selectedType !== 'ALL') {
      filtered = filtered.filter((bed) => bed.bedType === selectedType);
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((bed) => bed.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((bed) =>
        bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBeds(filtered);
  }, [beds, selectedType, selectedStatus, searchQuery]);

  const handleBookBed = async (bedId: string) => {
    if (isBooking) return;

    setIsBooking(true);
    try {
      const response = await fetch(`/api/beds/${bedId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: CURRENT_USER_ID }),
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">All Beds</h1>
        <p className="text-gray-600 text-lg">Browse and book available hospital beds</p>
      </div>

      <BedFilters
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <BedGrid beds={filteredBeds} onBook={handleBookBed} isBooking={isBooking} />
    </div>
  );
}
