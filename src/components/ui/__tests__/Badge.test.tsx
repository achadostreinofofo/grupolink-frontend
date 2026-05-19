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
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-700')
  })

  it('applies green variant', () => {
    render(<Badge variant="green">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('applies yellow variant', () => {
    render(<Badge variant="yellow">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('applies red variant', () => {
    render(<Badge variant="red">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('applies blue variant', () => {
    render(<Badge variant="blue">Info</Badge>)
    expect(screen.getByText('Info')).toHaveClass('bg-blue-100', 'text-blue-800')
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
