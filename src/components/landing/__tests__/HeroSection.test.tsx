import React from 'react'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '../HeroSection'

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('HeroSection', () => {
  it('renders the main heading', () => {
    render(<HeroSection />)
    expect(screen.getByText('Gerencie seus grupos')).toBeInTheDocument()
  })

  it('renders "Criar conta grátis" CTA', () => {
    render(<HeroSection />)
    expect(screen.getByRole('link', { name: /criar conta grátis/i })).toHaveAttribute('href', '/signup')
  })

  it('renders "Ver planos" link', () => {
    render(<HeroSection />)
    expect(screen.getByRole('link', { name: /ver planos/i })).toHaveAttribute('href', '#pricing')
  })

  it('renders the platform tagline', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Plataforma #1 para afiliados no WhatsApp/)).toBeInTheDocument()
  })

  it('renders demo stats', () => {
    render(<HeroSection />)
    expect(screen.getByText('12.847')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('+342')).toBeInTheDocument()
  })
})
