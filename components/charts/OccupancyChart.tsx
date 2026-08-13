"use client";
import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface Props { occupancyRate: number }

export function OccupancyChart({ occupancyRate }: Props) {
  const data = [
    { name: 'Occupied', value: occupancyRate },
    { name: 'Available', value: Math.max(0, 100 - occupancyRate) },
  ];
  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">Bed Occupancy Rate</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
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
