'use client';

import { useState } from 'react';
import { PatientSearchResult } from '@/types/patient';

interface BookingFormProps {
  onSelectPatient: (patientId: string) => void;
  onCreatePatient: () => void;
}

export function BookingForm({ onSelectPatient, onCreatePatient }: BookingFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/patients?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.patients);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Select Patient</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or phone"
            className="input-field flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn-primary px-6 py-2.5 whitespace-nowrap"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 mb-4">
            {searchResults.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className="p-4 card cursor-pointer hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-600">{patient.phone}</div>
                    <div className="text-xs text-gray-500">
                      DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No patients found</p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <button
          onClick={onCreatePatient}
          className="w-full px-6 py-3 border-2 border-sky-500 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors font-semibold flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Patient</span>
        </button>
      </div>
    </div>
  );
}
