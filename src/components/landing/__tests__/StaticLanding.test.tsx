import React from 'react'
import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '../FeaturesSection'
import { Navbar } from '../Navbar'
import { CtaSection } from '../CtaSection'
import { Footer } from '../Footer'

jest.mock('next/link', () => {
  const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('FeaturesSection', () => {
  it('renders the features heading', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Tudo que você precisa para escalar')).toBeInTheDocument()
  })

  it('renders all feature titles', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Smart Link com Cookies')).toBeInTheDocument()
    expect(screen.getByText('Round-Robin de 3 Níveis')).toBeInTheDocument()
    expect(screen.getByText('Analytics com UTM')).toBeInTheDocument()
    expect(screen.getByText('Blacklist Global')).toBeInTheDocument()
    expect(screen.getByText('Mensagens Agendadas')).toBeInTheDocument()
    expect(screen.getByText('Backup de Membros')).toBeInTheDocument()
  })

  it('renders with id="features"', () => {
    render(<FeaturesSection />)
    expect(document.getElementById('features')).toBeInTheDocument()
  })
})

describe('Navbar', () => {
  it('renders the GrupoLink brand', () => {
    render(<Navbar />)
    expect(screen.getAllByText('GrupoLink').length).toBeGreaterThan(0)
  })

  it('renders Entrar and Começar grátis buttons', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /começar grátis/i })).toHaveAttribute('href', '/signup')
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'Recursos' })).toHaveAttribute('href', '#features')
    expect(screen.getByRole('link', { name: 'Preços' })).toHaveAttribute('href', '#pricing')
  })
})

describe('CtaSection', () => {
  it('renders without crashing', () => {
    const { container } = render(<CtaSection />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('renders without crashing', () => {
    const { container } = render(<Footer />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
