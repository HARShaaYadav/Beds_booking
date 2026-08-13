'use client';

interface BedStatistics {
  total: number;
  available: number;
  locked: number;
  booked: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
}

interface AvailabilitySummaryProps {
  statistics: BedStatistics;
}

export function AvailabilitySummary({ statistics }: AvailabilitySummaryProps) {
  const stats = [
    {
      label: 'Total Beds',
      value: statistics.total,
      color: 'from-gray-600 to-gray-700',
      bgColor: 'from-gray-50 to-slate-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Available',
      value: statistics.available,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Locked',
      value: statistics.locked,
      color: 'from-yellow-600 to-amber-600',
      bgColor: 'from-yellow-50 to-amber-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      label: 'Booked',
      value: statistics.booked,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Occupied',
      value: statistics.occupied,
      color: 'from-red-600 to-rose-600',
      bgColor: 'from-red-50 to-rose-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Cleaning',
      value: statistics.cleaning,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      label: 'Maintenance',
      value: statistics.maintenance,
      color: 'from-gray-600 to-slate-600',
      bgColor: 'from-gray-50 to-slate-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="group card p-6 hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-scale-in border-2 border-transparent hover:border-opacity-0 cursor-default transform"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`inline-flex p-4 bg-gradient-to-br ${stat.bgColor} rounded-xl mb-4 group-hover:scale-125 transition-transform duration-300`}>
            <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:drop-shadow-lg`}>
              {stat.icon}
            </div>
          </div>
          <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:text-4xl transition-all`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">{stat.label}</div>
          
          {/* Hidden hover indicator */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`}></div>
        </div>
      ))}
    </div>
  );
}
