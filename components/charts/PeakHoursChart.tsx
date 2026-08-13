"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props { peakHours: Array<{ hour: number; cnt: number }> }

export function PeakHoursChart({ peakHours }: Props) {
  const data = peakHours.map((r: any) => ({ hour: `${r.hour}:00`, count: Number(r.cnt) }));

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">Peak Occupancy Hours</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
