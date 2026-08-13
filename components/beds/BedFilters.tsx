'use client';

import { BedType, BedStatus } from '@prisma/client';

interface BedFiltersProps {
  selectedType: BedType | 'ALL';
  selectedStatus: BedStatus | 'ALL';
  onTypeChange: (type: BedType | 'ALL') => void;
  onStatusChange: (status: BedStatus | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function BedFilters({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: BedFiltersProps) {
  const bedTypes: Array<{ value: BedType | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Types' },
    { value: BedType.GENERAL, label: 'General' },
    { value: BedType.ICU, label: 'ICU' },
    { value: BedType.EMERGENCY, label: 'Emergency' },
    { value: BedType.PRIVATE, label: 'Private' },
    { value: BedType.ISOLATION, label: 'Isolation' },
  ];

  const bedStatuses: Array<{ value: BedStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Statuses' },
    { value: BedStatus.AVAILABLE, label: 'Available' },
    { value: BedStatus.LOCKED, label: 'Locked' },
    { value: BedStatus.OCCUPIED, label: 'Occupied' },
    { value: BedStatus.CLEANING, label: 'Cleaning' },
    { value: BedStatus.MAINTENANCE, label: 'Maintenance' },
  ];

  return (
    <div className="card p-6 mb-6 animate-slide-up">
      <div className="flex items-center space-x-2 mb-5">
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
      </div>
      
      <div className="space-y-5">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search by Bed Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="e.g., ICU-01, GEN-05"
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Bed Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Bed Type
          </label>
          <div className="flex flex-wrap gap-2">
            {bedTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedType === type.value
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {bedStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => onStatusChange(status.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedStatus === status.value
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
