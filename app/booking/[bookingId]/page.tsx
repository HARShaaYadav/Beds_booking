'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookingWithDetails } from '@/types/booking';
import { BookingTimer } from '@/components/booking/BookingTimer';
import { BookingForm } from '@/components/booking/BookingForm';
import { Patient } from '@/types/patient';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
  });

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        alert('Booking not found');
        router.push('/beds');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to fetch booking');
      router.push('/beds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpire = async () => {
    alert('Your reservation has expired. Please try again.');
    router.push('/beds');
  };

  const handleSelectPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPatient(data.patient);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatientData.name || !newPatientData.phone || !newPatientData.dateOfBirth) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatientData),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPatient(data.patient);
        setShowCreatePatient(false);
      } else {
        alert(data.message || 'Failed to create patient');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient');
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    setIsConfirming(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking confirmed successfully!');
        router.push('/dashboard');
      } else {
        alert(data.message || 'Failed to confirm booking');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking cancelled');
        router.push('/beds');
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">Complete Your Booking</h1>
        <p className="text-gray-600 mt-2">Bed temporarily reserved for you</p>
      </div>

      {booking.lockExpiresAt && (
        <div className="mb-6 sm:mb-8">
          <BookingTimer
            expiresAt={new Date(booking.lockExpiresAt)}
            onExpire={handleExpire}
          />
        </div>
      )}

      {/* Bed Details */}
      <div className="card p-6 mb-6 sm:mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Bed Details</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 bg-sky-50 rounded-lg">
            <span className="text-sm text-gray-600 block">Bed Number</span>
            <span className="text-lg font-semibold text-gray-900">{booking.bed?.bedNumber}</span>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg">
            <span className="text-sm text-gray-600 block">Type</span>
            <span className="text-lg font-semibold text-gray-900">{booking.bed?.bedType}</span>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg">
            <span className="text-sm text-gray-600 block">Ward</span>
            <span className="text-lg font-semibold text-gray-900">{booking.bed?.ward}</span>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg">
            <span className="text-sm text-gray-600 block">Floor</span>
            <span className="text-lg font-semibold text-gray-900">{booking.bed?.floor}</span>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      {!selectedPatient && !showCreatePatient && (
        <div className="card p-6 mb-6 sm:mb-8">
          <BookingForm
            onSelectPatient={handleSelectPatient}
            onCreatePatient={() => setShowCreatePatient(true)}
          />
        </div>
      )}

      {/* Create Patient Form */}
      {showCreatePatient && (
        <div className="card p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Patient</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={newPatientData.name}
                onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                placeholder="Full name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={newPatientData.phone}
                onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                value={newPatientData.dateOfBirth}
                onChange={(e) => setNewPatientData({ ...newPatientData, dateOfBirth: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={newPatientData.gender}
                onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleCreatePatient}
                className="btn-success flex-1"
              >
                Create Patient
              </button>
              <button
                onClick={() => setShowCreatePatient(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Patient */}
      {selectedPatient && (
        <div className="card p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Selected Patient</span>
          </h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="font-semibold text-gray-900">{selectedPatient.name}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Phone:</span>
              <span className="font-semibold text-gray-900">{selectedPatient.phone}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Date of Birth:</span>
              <span className="font-semibold text-gray-900">
                {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Gender:</span>
              <span className="font-semibold text-gray-900">{selectedPatient.gender}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedPatient(null)}
            className="text-sky-600 hover:text-sky-700 text-sm font-semibold flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Change Patient</span>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleConfirmBooking}
          disabled={!selectedPatient || isConfirming || isCancelling}
          className="btn-success flex-1 py-3 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{isConfirming ? 'Confirming...' : 'Confirm Booking'}</span>
        </button>
        <button
          onClick={handleCancelBooking}
          disabled={isConfirming || isCancelling}
          className="btn-danger flex-1 py-3 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
        </button>
      </div>
    </div>
  );
}
