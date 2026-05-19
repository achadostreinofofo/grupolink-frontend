import React from 'react'
import { render, screen } from '@testing-library/react'
import { ClicksChart } from '../ClicksChart'
import type { DailyClick } from '@/types'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-count={data.length}>{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => <div data-testid="bar" data-key={dataKey} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

const sampleData: DailyClick[] = [
  { date: '2024-01-01', clicks: 10 },
  { date: '2024-01-02', clicks: 20 },
  { date: '2024-01-03', clicks: 15 },
  { date: '2024-01-04', clicks: 5 },
  { date: '2024-01-05', clicks: 30 },
  { date: '2024-01-06', clicks: 25 },
  { date: '2024-01-07', clicks: 18 },
]

describe('ClicksChart', () => {
  it('renders the chart container', () => {
    render(<ClicksChart data={sampleData} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders a BarChart', () => {
    render(<ClicksChart data={sampleData} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders Bar with clicks dataKey', () => {
    render(<ClicksChart data={sampleData} />)
    expect(screen.getByTestId('bar')).toHaveAttribute('data-key', 'clicks')
  })

  it('slices last 30 days by default', () => {
    const data = Array.from({ length: 40 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      clicks: i,
    }))
    render(<ClicksChart data={data} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '30')
  })

  it('slices last 7 days when days=7', () => {
    render(<ClicksChart data={sampleData} days={7} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', String(sampleData.length))
  })

  it('renders with empty data', () => {
    render(<ClicksChart data={[]} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '0')
  })
})
