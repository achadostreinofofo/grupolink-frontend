import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies gray variant by default', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-night-600', 'text-night-200')
  })

  it('applies green variant', () => {
    render(<Badge variant="green">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-green-900/30', 'text-green-400')
  })

  it('applies yellow variant', () => {
    render(<Badge variant="yellow">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-900/30', 'text-yellow-400')
  })

  it('applies red variant', () => {
    render(<Badge variant="red">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-red-900/30', 'text-red-400')
  })

  it('applies blue variant', () => {
    render(<Badge variant="blue">Info</Badge>)
    expect(screen.getByText('Info')).toHaveClass('bg-blue-900/30', 'text-blue-400')
  })

  it('merges custom className', () => {
    render(<Badge className="font-bold">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('font-bold')
  })

  it('renders as a span element', () => {
    render(<Badge>Span</Badge>)
    expect(screen.getByText('Span').tagName).toBe('SPAN')
  })

  it('applies base classes', () => {
    render(<Badge>Base</Badge>)
    const badge = screen.getByText('Base')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'text-xs', 'font-medium')
  })
})
