'use client';

import { useEffect, useState } from 'react';

interface BookingTimerProps {
  expiresAt: Date;
  onExpire: () => void;
}

export function BookingTimer({ expiresAt, onExpire }: BookingTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('00:00');
        onExpire();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeRemaining(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className={`text-center p-6 rounded-lg ${isExpired ? 'bg-red-100' : 'bg-yellow-50'} border ${isExpired ? 'border-red-200' : 'border-yellow-200'}`}>
      <div className="text-sm text-gray-600 mb-2">
        {isExpired ? 'Reservation Expired' : 'Reservation Expires In'}
      </div>
      <div className={`text-4xl font-bold ${isExpired ? 'text-red-700' : 'text-yellow-700'} font-mono`}>
        {timeRemaining}
      </div>
      {!isExpired && (
        <div className="text-sm text-gray-600 mt-2">
          Complete your booking before time runs out
        </div>
      )}
    </div>
  );
}
