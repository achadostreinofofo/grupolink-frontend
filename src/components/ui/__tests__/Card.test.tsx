import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card body</Card>)
    expect(screen.getByText('Card body')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'border', 'border-gray-200', 'shadow-sm')
  })

  it('merges custom className', () => {
    render(<Card data-testid="card" className="w-full">Content</Card>)
    expect(screen.getByTestId('card')).toHaveClass('w-full')
  })

  it('renders as a div', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card').tagName).toBe('DIV')
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header title</CardHeader>)
    expect(screen.getByText('Header title')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardHeader data-testid="header">Title</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-100')
  })

  it('merges custom className', () => {
    render(<CardHeader data-testid="header" className="flex justify-between">Title</CardHeader>)
    expect(screen.getByTestId('header')).toHaveClass('flex', 'justify-between')
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content here</CardContent>)
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<CardContent data-testid="content">Body</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('px-6', 'py-4')
  })

  it('merges custom className', () => {
    render(<CardContent data-testid="content" className="space-y-4">Body</CardContent>)
    expect(screen.getByTestId('content')).toHaveClass('space-y-4')
  })
})
