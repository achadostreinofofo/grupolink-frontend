import React from 'react'
import { render, screen } from '@testing-library/react'
import { UtmTable } from '../UtmTable'
import type { UtmEntry } from '@/types'

const sampleRows: UtmEntry[] = [
  { label: 'google', clicks: 150, percentage: 60 },
  { label: 'facebook', clicks: 75, percentage: 30 },
  { label: 'direct', clicks: 25, percentage: 10 },
]

describe('UtmTable', () => {
  describe('with data', () => {
    it('renders the title', () => {
      render(<UtmTable title="Fonte" rows={sampleRows} />)
      expect(screen.getByText('Fonte')).toBeInTheDocument()
    })

    it('renders each row label', () => {
      render(<UtmTable title="Fonte" rows={sampleRows} />)
      expect(screen.getByText('google')).toBeInTheDocument()
      expect(screen.getByText('facebook')).toBeInTheDocument()
      expect(screen.getByText('direct')).toBeInTheDocument()
    })

    it('renders percentage values', () => {
      render(<UtmTable title="Fonte" rows={sampleRows} />)
      expect(screen.getByText('(60%)')).toBeInTheDocument()
      expect(screen.getByText('(30%)')).toBeInTheDocument()
    })

    it('renders progress bar with correct width', () => {
      const { container } = render(<UtmTable title="Fonte" rows={sampleRows} />)
      const bars = container.querySelectorAll('.bg-brand-500')
      expect(bars[0]).toHaveStyle({ width: '60%' })
    })

    it('does not show empty state message', () => {
      render(<UtmTable title="Fonte" rows={sampleRows} />)
      expect(screen.queryByText(/Sem dados/i)).not.toBeInTheDocument()
    })
  })

  describe('with empty rows', () => {
    it('renders the title', () => {
      render(<UtmTable title="Campanhas" rows={[]} />)
      expect(screen.getByText('Campanhas')).toBeInTheDocument()
    })

    it('shows empty state message', () => {
      render(<UtmTable title="Campanhas" rows={[]} />)
      expect(screen.getByText(/Sem dados com UTM neste período/i)).toBeInTheDocument()
    })

    it('does not render row items', () => {
      const { container } = render(<UtmTable title="Campanhas" rows={[]} />)
      expect(container.querySelectorAll('.bg-brand-500').length).toBe(0)
    })
  })
})
