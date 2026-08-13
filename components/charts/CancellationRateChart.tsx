"use client";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface Props { cancellationRate: number }

export function CancellationRateChart({ cancellationRate }: Props) {
  const data = [
    { name: 'Cancelled', value: Number(cancellationRate.toFixed(2)) },
    { name: 'Not Cancelled', value: Math.max(0, 100 - Number(cancellationRate.toFixed(2))) },
  ];
  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">Cancellation Rate (30d)</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
