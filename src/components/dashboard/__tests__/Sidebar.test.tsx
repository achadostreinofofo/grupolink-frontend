import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'

const mockPush = jest.fn()
const mockPathname = jest.fn().mockReturnValue('/dashboard')

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/link', () => {
  const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('@/lib/auth', () => ({
  clearAuth: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockPathname.mockReturnValue('/dashboard')
})

describe('Sidebar', () => {
  it('renders the GrupoLink brand name', () => {
    render(<Sidebar />)
    expect(screen.getByText('GrupoLink')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Sidebar />)
    expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    expect(screen.getByText('Estruturas')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Grupos Monitorados')).toBeInTheDocument()
    expect(screen.getByText('Plano')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    render(<Sidebar />)
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('applies active class to /dashboard when pathname is /dashboard', () => {
    mockPathname.mockReturnValue('/dashboard')
    render(<Sidebar />)
    const dashboardLink = screen.getByRole('link', { name: /visão geral/i })
    expect(dashboardLink).toHaveClass('bg-brand-600', 'text-white')
  })

  it('does not apply active class to /dashboard when on another route', () => {
    mockPathname.mockReturnValue('/dashboard/structures')
    render(<Sidebar />)
    const dashboardLink = screen.getByRole('link', { name: /visão geral/i })
    expect(dashboardLink).not.toHaveClass('bg-brand-600')
  })

  it('applies active class to /dashboard/structures when pathname starts with it', () => {
    mockPathname.mockReturnValue('/dashboard/structures/abc')
    render(<Sidebar />)
    const structuresLink = screen.getByRole('link', { name: /estruturas/i })
    expect(structuresLink).toHaveClass('bg-brand-600', 'text-white')
  })

  it('calls clearAuth and redirects to / on logout', async () => {
    const { clearAuth } = await import('@/lib/auth')
    const user = userEvent.setup()
    render(<Sidebar />)
    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(clearAuth).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('nav links have correct href attributes', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: /visão geral/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /estruturas/i })).toHaveAttribute('href', '/dashboard/structures')
    expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute('href', '/dashboard/analytics')
  })
})
