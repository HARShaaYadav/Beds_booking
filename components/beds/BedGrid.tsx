'use client';

import { BedWithDetails } from '@/types/bed';
import { BedCard } from './BedCard';

interface BedGridProps {
  beds: BedWithDetails[];
  onBook?: (bedId: string) => void;
  isBooking?: boolean;
}

export function BedGrid({ beds, onBook, isBooking }: BedGridProps) {
  if (beds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No beds found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {beds.map((bed) => (
        <BedCard
          key={bed.id}
          bed={bed}
          onBook={onBook}
          isBooking={isBooking}
        />
      ))}
    </div>
  );
}
