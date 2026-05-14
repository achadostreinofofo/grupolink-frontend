'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DailyClick } from '@/types'

interface ClicksChartProps {
  data: DailyClick[]
  days?: 7 | 30
}

export function ClicksChart({ data, days = 30 }: ClicksChartProps) {
  const displayed = data.slice(-days)

  const formatted = displayed.map(d => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', {
      day:   '2-digit',
      month: days === 7 ? 'short' : undefined,
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          interval={days === 30 ? 4 : 0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Cliques']}
        />
        <Bar dataKey="clicks" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
