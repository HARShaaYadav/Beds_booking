"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props { icuUtilization: number }

export function ICUUtilizationChart({ icuUtilization }: Props) {
  const data = [{ name: 'ICU', value: icuUtilization }];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">ICU Utilization</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
