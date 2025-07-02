'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { mockProgressData } from '@/lib/data';

export function OverallProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mockProgressData.overall}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[50, 100]} />
        <Tooltip
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ScoreByTypeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={mockProgressData.byType}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis domain={[50, 100]} />
        <Tooltip
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
