import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChurnChart } from '../ChurnChart'
import type { DailyExit } from '@/types'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-count={data.length}>{children}</div>
  ),
  Area: ({ dataKey }: { dataKey: string }) => <div data-testid="area" data-key={dataKey} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  defs: ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>,
  linearGradient: ({ children }: { children: React.ReactNode }) => <linearGradient>{children}</linearGradient>,
  stop: () => null,
}))

const sampleData: DailyExit[] = [
  { date: '2024-01-01', exits: 5 },
  { date: '2024-01-02', exits: 3 },
  { date: '2024-01-03', exits: 8 },
]

describe('ChurnChart', () => {
  it('renders the chart container', () => {
    render(<ChurnChart data={sampleData} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders an AreaChart', () => {
    render(<ChurnChart data={sampleData} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('renders Area with exits dataKey', () => {
    render(<ChurnChart data={sampleData} />)
    expect(screen.getByTestId('area')).toHaveAttribute('data-key', 'exits')
  })

  it('slices last 30 data points', () => {
    const data = Array.from({ length: 40 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      exits: i,
    }))
    render(<ChurnChart data={data} />)
    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-count', '30')
  })

  it('renders with empty data', () => {
    render(<ChurnChart data={[]} />)
    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-count', '0')
  })
})
