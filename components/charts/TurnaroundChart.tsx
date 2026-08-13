"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props { avgTurnaroundHours: number }

export function TurnaroundChart({ avgTurnaroundHours }: Props) {
  const data = [{ name: 'Turnaround', hours: Number(avgTurnaroundHours.toFixed(2)) }];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">Turnaround Time After Discharge (hrs)</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
