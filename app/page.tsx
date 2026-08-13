'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Main Hero Content */}
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-full mb-6 text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Real-Time Bed Management System
            </div>
            
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Smart Hospital
              </span>
              <br />
              <span className="text-gray-800">Bed Booking</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience seamless real-time bed availability tracking with automatic lock management and industry-leading double-booking prevention
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold text-lg"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Dashboard
              </Link>
              <Link
                href="/beds"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-sky-500 text-sky-600 rounded-xl hover:bg-sky-50 transition-all duration-200 font-semibold text-lg"
              >
                Browse All Beds
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-sky-600">100%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-600">0ms</div>
                <div className="text-sm text-gray-600">Real-time Sync</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">5min</div>
                <div className="text-sm text-gray-600">Booking Window</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 animate-fade-in">
            {/* Feature 1 */}
            <div className="group card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                See bed availability update instantly across all users with Socket.IO powered real-time synchronization
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Temporary Locks</h3>
              <p className="text-gray-600 leading-relaxed">
                Secure 5-minute reservation window with automatic expiration to complete your booking without rush
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Double Booking</h3>
              <p className="text-gray-600 leading-relaxed">
                Atomic database operations with Prisma transactions prevent conflicts and ensure data integrity
              </p>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

<style jsx>{`
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`}</style>
