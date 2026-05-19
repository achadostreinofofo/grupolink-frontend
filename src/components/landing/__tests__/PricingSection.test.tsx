import React from 'react'
import { render, screen } from '@testing-library/react'
import { PricingSection } from '../PricingSection'

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('PricingSection', () => {
  it('renders the section heading', () => {
    render(<PricingSection />)
    expect(screen.getByText('Planos sem enrolação')).toBeInTheDocument()
  })

  it('renders all three plan names', () => {
    render(<PricingSection />)
    expect(screen.getByText('Smart')).toBeInTheDocument()
    expect(screen.getByText('Diamond')).toBeInTheDocument()
    expect(screen.getByText('Black')).toBeInTheDocument()
  })

  it('renders plan prices', () => {
    const { container } = render(<PricingSection />)
    expect(container.textContent).toContain('128')
    expect(container.textContent).toContain('290')
    expect(container.textContent).toContain('453')
  })

  it('renders the "MAIS POPULAR" badge on Diamond plan', () => {
    render(<PricingSection />)
    expect(screen.getByText('MAIS POPULAR')).toBeInTheDocument()
  })

  it('renders CTA buttons linking to /signup', () => {
    render(<PricingSection />)
    const links = screen.getAllByRole('link')
    const signupLinks = links.filter(l => l.getAttribute('href') === '/signup')
    expect(signupLinks.length).toBe(3)
  })

  it('renders plan CTAs', () => {
    render(<PricingSection />)
    expect(screen.getByText('Começar com Smart')).toBeInTheDocument()
    expect(screen.getByText('Escolher Diamond')).toBeInTheDocument()
    expect(screen.getByText('Falar com vendas')).toBeInTheDocument()
  })

  it('renders pricing section with id="pricing"', () => {
    render(<PricingSection />)
    const section = document.getElementById('pricing')
    expect(section).toBeInTheDocument()
  })
})
