"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props { avgHours: number }

export function AvgLengthOfStayChart({ avgHours }: Props) {
  const data = [ { name: 'Avg LOS', hours: Number(avgHours.toFixed(2)) } ];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">Average Length of Stay (hrs)</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
