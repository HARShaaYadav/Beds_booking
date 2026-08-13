import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Hospital Bed Booking System",
  description: "Real-time hospital bed and ICU booking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
          {/* Header */}
          <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    MediBook
                  </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50 font-medium transition-all duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50 font-medium transition-all duration-200"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </span>
                  </Link>
                  <Link
                    href="/beds"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50 font-medium transition-all duration-200"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>All Beds</span>
                    </span>
                  </Link>
                  <Link
                    href="/beds/icu"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50 font-medium transition-all duration-200"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>ICU Beds</span>
                    </span>
                  </Link>
                </nav>


              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 animate-fade-in">{children}</main>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-700 text-sm font-medium">
                © 2024 MediBook. Real-time Hospital Bed Management System.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>System Online</span>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
