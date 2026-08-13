'use client';

import { useEffect, useState } from 'react';
import { AvailabilitySummary } from '@/components/dashboard/AvailabilitySummary';
import dynamic from 'next/dynamic';

const OccupancyChart = dynamic(() => import('@/components/charts/OccupancyChart').then(m => m.OccupancyChart), { ssr: false });
const ICUUtilizationChart = dynamic(() => import('@/components/charts/ICUUtilizationChart').then(m => m.ICUUtilizationChart), { ssr: false });
const AvgLengthOfStayChart = dynamic(() => import('@/components/charts/AvgLengthOfStayChart').then(m => m.AvgLengthOfStayChart), { ssr: false });
const TurnaroundChart = dynamic(() => import('@/components/charts/TurnaroundChart').then(m => m.TurnaroundChart), { ssr: false });
const PeakHoursChart = dynamic(() => import('@/components/charts/PeakHoursChart').then(m => m.PeakHoursChart), { ssr: false });
const CancellationRateChart = dynamic(() => import('@/components/charts/CancellationRateChart').then(m => m.CancellationRateChart), { ssr: false });
import { getSocket } from '@/components/realtime/LiveConnectionStatus';

interface BedStatistics {
  total: number;
  available: number;
  locked: number;
  booked: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
}

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<BedStatistics>({
    total: 0,
    available: 0,
    locked: 0,
    booked: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/beds/statistics');
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    // fetch analytics
    (async function(){
      try{
        const res = await fetch('/api/analytics');
        const data = await res.json();
        if(data.success) setAnalytics(data.metrics);
      }catch(e){
        console.error('Failed to fetch analytics', e);
      }
    })();

    // Set up real-time updates
    const socket = getSocket();

    const handleBedStatusChange = () => {
      // Refetch statistics when any bed status changes
      fetchStatistics();
    };

    socket.on('bed-status-changed', handleBedStatusChange);
    socket.on('bed-locked', handleBedStatusChange);
    socket.on('bed-unlocked', handleBedStatusChange);
    socket.on('bed-booked', handleBedStatusChange);

    // Refresh every 30 seconds to stay in sync
    const interval = setInterval(fetchStatistics, 30000);

    return () => {
      socket.off('bed-status-changed', handleBedStatusChange);
      socket.off('bed-locked', handleBedStatusChange);
      socket.off('bed-unlocked', handleBedStatusChange);
      socket.off('bed-booked', handleBedStatusChange);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">Dashboard</h1>
        <p className="text-gray-600 text-lg font-medium">Real-time hospital bed management & analytics</p>
      </div>

      <AvailabilitySummary statistics={statistics} />

      {/* Analytics Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {analytics && (
          <>
            <div className="col-span-1">
              <OccupancyChart occupancyRate={analytics.occupancyRate} />
            </div>
            <div className="col-span-1">
              <ICUUtilizationChart icuUtilization={analytics.icuUtilization} />
            </div>
            <div className="col-span-1">
              <AvgLengthOfStayChart avgHours={analytics.avgLengthOfStayHours} />
            </div>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics && (
          <>
            <TurnaroundChart avgTurnaroundHours={analytics.avgTurnaroundHours} />
            <PeakHoursChart peakHours={analytics.peakHours} />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics && <CancellationRateChart cancellationRate={analytics.cancellationRate} />}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Quick Actions Section */}
        <div className="card p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-sky-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-lg">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <a
              href="/beds?status=AVAILABLE"
              className="group block p-5 bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg hover:border-green-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg text-green-900 group-hover:text-green-700 mb-1">View Available Beds</div>
                  <div className="text-sm text-green-700">
                    <span className="font-semibold text-xl">{statistics.available}</span> beds ready for booking
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
            <a
              href="/beds/icu"
              className="group block p-5 bg-gradient-to-br from-rose-50 via-red-50 to-red-100 border-2 border-red-200 rounded-xl hover:shadow-lg hover:border-red-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg text-red-900 group-hover:text-red-700 mb-1">ICU Beds (Critical Care)</div>
                  <div className="text-sm text-red-700">View intensive care units</div>
                </div>
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <svg className="w-6 h-6 text-red-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* System Status Section */}
        <div className="card p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
          </div>
          <div className="space-y-4">
            {/* Occupancy Rate */}
            <div className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-default">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 font-semibold">Occupancy Rate</span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {statistics.total > 0
                    ? Math.round(((statistics.occupied + statistics.booked) / statistics.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${statistics.total > 0 ? Math.round(((statistics.occupied + statistics.booked) / statistics.total) * 100) : 0}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Active Bookings */}
            <div className="group p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-default">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 font-semibold">Active Bookings</span>
                </div>
                <span className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform inline-block">
                  {statistics.locked + statistics.occupied}
                </span>
              </div>
            </div>

            {/* Under Maintenance */}
            <div className="group p-5 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-default">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700 font-semibold">Under Maintenance</span>
                </div>
                <span className="text-3xl font-bold text-orange-600 group-hover:scale-110 transition-transform inline-block">
                  {statistics.cleaning + statistics.maintenance}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
