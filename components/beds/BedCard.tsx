'use client';

import { BedWithDetails } from '@/types/bed';
import { BedStatusBadge } from './BedStatusBadge';
import { BedStatus } from '@prisma/client';

interface BedCardProps {
  bed: BedWithDetails;
  onBook?: (bedId: string) => void;
  isBooking?: boolean;
}

export function BedCard({ bed, onBook, isBooking }: BedCardProps) {
  const canBook = bed.status === BedStatus.AVAILABLE && !isBooking;

  const getBedTypeConfig = (type: string) => {
    switch (type) {
      case 'ICU':
        return { label: 'ICU', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'GENERAL':
        return { label: 'General', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'EMERGENCY':
        return { label: 'Emergency', color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'PRIVATE':
        return { label: 'Private', color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'ISOLATION':
        return { label: 'Isolation', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      default:
        return { label: type, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const bedTypeConfig = getBedTypeConfig(bed.bedType);

  return (
    <div className="group card p-6 hover:shadow-xl transition-all duration-300 animate-scale-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-3">
          <div className={`${bedTypeConfig.bgColor} p-3 rounded-xl`}>
            <svg className={`w-6 h-6 ${bedTypeConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">{bed.bedNumber}</h3>
            <p className={`text-sm font-semibold ${bedTypeConfig.color}`}>{bedTypeConfig.label}</p>
          </div>
        </div>
        <BedStatusBadge status={bed.status} />
      </div>

      {/* Details */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Ward
          </span>
          <span className="font-semibold text-gray-900">{bed.ward}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Floor
          </span>
          <span className="font-semibold text-gray-900">{bed.floor}</span>
        </div>
        {bed.patient && (
          <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
            <span className="text-sm text-sky-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient
            </span>
            <span className="font-semibold text-sky-900">{bed.patient.name}</span>
          </div>
        )}
      </div>

      {/* Lock Warning */}
      {bed.status === BedStatus.LOCKED && (
        <div className="mb-5 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800 font-medium">Currently being booked by another user</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {canBook && onBook && (
        <button
          onClick={() => onBook(bed.id)}
          disabled={isBooking}
          className="w-full btn-success flex items-center justify-center space-x-2 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>{isBooking ? 'Processing...' : 'Book Now'}</span>
        </button>
      )}

      {!canBook && bed.status !== BedStatus.LOCKED && (
        <button
          disabled
          className="w-full bg-gray-200 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-semibold"
        >
          Not Available
        </button>
      )}

      {bed.status === BedStatus.LOCKED && (
        <button
          disabled
          className="w-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 py-3 px-4 rounded-lg cursor-not-allowed font-semibold border border-yellow-200"
        >
          Temporarily Reserved
        </button>
      )}
    </div>
  );
}
